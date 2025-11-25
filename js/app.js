const FILES = [
  'src/data/history-edu.json',
  'src/data/history-int.json',
  'src/data/history-proj.json'
];

const heroEl = document.getElementById('hero');
const rowsEl = document.getElementById('rows');
const filterEl = document.getElementById('filter');
let ITEMS = [];

function formatDateRange(dateArr){
  if(!Array.isArray(dateArr)) return '';
  const [start,end] = dateArr;
  if(!start) return '';
  return end ? `${start} → ${end}` : `${start}`;
}

function makeCard(item){
  const el = document.createElement('div');
  el.className = 'card';

  const media = document.createElement('div');
  media.className = 'card-media';
  // try to pick an image from item.images or urls; fallback to YouTube thumbnail if available
  const youtubeUrl = item.urls?.youtube_video || item.youtube_video;
  const ytId = youtubeUrl ? getYouTubeId(youtubeUrl) : null;
  let img = (item.images && Object.values(item.images).find(Boolean)) || item.image || item.thumbnail || '';
  if(!img && ytId){ img = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`; }
  if(img){ media.style.backgroundImage = `url(${img})`; }
  // add play overlay if this item has a youtube video
  if(ytId){
    const overlay = document.createElement('div'); overlay.className = 'play-overlay'; overlay.innerHTML = '▸';
    media.appendChild(overlay);
  }
  el.appendChild(media);

  const body = document.createElement('div');
  body.className = 'card-body';
  const t = document.createElement('h4');
  t.textContent = item.title || item.type || 'Untitled';
  body.appendChild(t);
  const meta = document.createElement('div');
  meta.className = 'meta';
  const inst = item.institution || item.company;
  meta.textContent = formatDateRange(item.date) + (inst && inst.location ? ` · ${inst.location}` : '');
  body.appendChild(meta);

  el.appendChild(body);
  return el;
}

async function tryFetch(file){
  try{
    const r = await fetch(file, {cache: 'no-store'});
    if(!r.ok) return null;
    const data = await r.json();
    if(Array.isArray(data)) return data;
    if(data.items && Array.isArray(data.items)) return data.items;
    return null;
  }catch(e){
    return null;
  }
}

function groupByType(items){
  const map = {};
  for(const it of items){
    if(!it.show) continue;
    const k = it.type || 'other';
    if(!map[k]) map[k] = [];
    map[k].push(it);
  }
  return map;
}

function pickFeatured(items){
  // prefer most recent project, else first item
  const projects = items.filter(i=>i.type === 'project');
  if(projects.length) return projects.sort((a,b)=> (b.date?.[0]||'').localeCompare(a.date?.[0]||''))[0];
  return items[0] || null;
}

function renderHero(item){
  if(!item){ heroEl.style.display = 'none'; return; }
  heroEl.style.display = '';
  const inst = item.institution || item.company || {};
  const img = (item.images && Object.values(item.images).find(Boolean)) || item.image || '';
  heroEl.style.background = img ? `url(${img}) center/cover no-repeat` : 'linear-gradient(90deg,#111827,#374151)';
  heroEl.innerHTML = `\n    <div class="hero-inner">\n      <h2>${item.title}</h2>\n      <p>${inst.name ? inst.name + (inst.name_short ? ` (${inst.name_short})` : '') : ''}</p>\n      <p>${(item.description||'').slice(0,220)}${(item.description && item.description.length>220)?'...':''}</p>\n    </div>\n  `;
}

function makeRow(title, items){
  const row = document.createElement('section');
  row.className = 'row';

  const header = document.createElement('div');
  header.className = 'row-header';
  const h = document.createElement('h3'); h.textContent = title; header.appendChild(h);

  const controls = document.createElement('div'); controls.className = 'row-controls';
  const prev = document.createElement('button'); prev.className = 'row-btn'; prev.setAttribute('aria-label','向左捲動'); prev.textContent = '◀';
  const next = document.createElement('button'); next.className = 'row-btn'; next.setAttribute('aria-label','向右捲動'); next.textContent = '▶';
  controls.appendChild(prev); controls.appendChild(next);
  header.appendChild(controls);

  const track = document.createElement('div'); track.className = 'row-track'; track.setAttribute('tabindex','0');
  items.forEach(it=> track.appendChild(makeCardWithLink(it)));

  prev.addEventListener('click', ()=>{ track.scrollBy({left: -Math.round(track.clientWidth*0.8), behavior:'smooth'}); });
  next.addEventListener('click', ()=>{ track.scrollBy({left: Math.round(track.clientWidth*0.8), behavior:'smooth'}); });

  row.appendChild(header); row.appendChild(track);
  return row;
}

function openModal(item){
  const modal = document.getElementById('modal');
  const media = document.getElementById('modal-media');
  const title = document.getElementById('modal-title');
  const meta = document.getElementById('modal-meta');
  const desc = document.getElementById('modal-desc');
  const tags = document.getElementById('modal-tags');
  const link = document.getElementById('modal-link');

  const youtubeUrl = item.urls?.youtube_video || item.youtube_video;
  const ytId = youtubeUrl ? getYouTubeId(youtubeUrl) : null;
  const img = (item.images && Object.values(item.images).find(Boolean)) || item.image || '';
  if(ytId){
    // embed youtube preview (autoplay muted)
    media.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&rel=0&modestbranding=1" frameborder="0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    media.style.backgroundImage = '';
  } else {
    media.innerHTML = '';
    if(img){ media.style.backgroundImage = `url(${img})`; media.style.backgroundColor = '' } else { media.style.backgroundImage = ''; media.style.backgroundColor = '#111'; }
  }
  title.textContent = item.title || '';
  const inst = item.institution || item.company || {};
  meta.textContent = `${inst.name || ''}${inst.location ? ' · ' + inst.location : ''} ${item.date ? '· ' + (item.date[0] || '') : ''}`;
  desc.textContent = item.description || '';
  tags.innerHTML = '';
  (item.tags || []).forEach(t=>{ const s = document.createElement('span'); s.className='tag'; s.textContent=t; tags.appendChild(s); });
  link.href = item.urls?.product_website || item.institution?.url || item.company?.url || '#';

  modal.setAttribute('aria-hidden','false');

  // focus for accessibility
  const closeBtn = modal.querySelector('[data-close]');
  closeBtn?.focus();
}

function closeModal(){
  const modal = document.getElementById('modal');
  const media = document.getElementById('modal-media');
  // remove iframe to stop playback
  media.innerHTML = '';
  media.style.backgroundImage = '';
  modal.setAttribute('aria-hidden','true');
}

function makeCardWithLink(item){
  const card = makeCard(item);
  const wrapper = document.createElement('div');
  wrapper.style.cursor = 'pointer';
  wrapper.setAttribute('role','button');
  wrapper.setAttribute('tabindex','0');
  wrapper.appendChild(card);
  wrapper.addEventListener('click', (e)=>{ e.preventDefault(); openModal(item); });
  wrapper.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(item); } });
  return wrapper;
}

// helper: extract YouTube video id from various URL formats
function getYouTubeId(url){
  if(!url) return null;
  try{
    // common formats: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
    const u = new URL(url);
    if(u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if(u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1];
    if(u.searchParams && u.searchParams.get('v')) return u.searchParams.get('v');
    // fallback: last path segment
    const parts = u.pathname.split('/'); return parts.pop() || null;
  }catch(e){
    // fallback regex
    const m = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return m ? m[1] : null;
  }
}

async function loadAll(){
  rowsEl.innerHTML = '<div class="no-data">載入中…</div>';
  const all = [];
  for(const f of FILES){
    const data = await tryFetch(f);
    if(data) all.push(...data);
  }
  ITEMS = all;
  renderAll(ITEMS);
}

function renderAll(items){
  const featured = pickFeatured(items);
  renderHero(featured);
  const groups = groupByType(items);
  rowsEl.innerHTML = '';
  for(const [type, arr] of Object.entries(groups)){
    const title = type[0].toUpperCase() + type.slice(1);
    rowsEl.appendChild(makeRow(title, arr));
  }
}

function filterAndRender(q){
  if(!q) return renderAll(ITEMS);
  const ql = q.toLowerCase();
  const filtered = ITEMS.filter(it=>{
    if(it.title && it.title.toLowerCase().includes(ql)) return true;
    if(it.description && it.description.toLowerCase().includes(ql)) return true;
    const inst = it.institution || it.company;
    if(inst){ if(inst.name && inst.name.toLowerCase().includes(ql)) return true; if(inst.short_description && inst.short_description.toLowerCase().includes(ql)) return true; }
    if(Array.isArray(it.tags) && it.tags.join(' ').toLowerCase().includes(ql)) return true;
    return false;
  });
  renderAll(filtered);
}

filterEl?.addEventListener('input', ()=>{ filterAndRender(filterEl.value.trim()); });

// initial
loadAll();

// expose for debug
window.__HISTORY_APP = { loadAll, ITEMS, openModal, closeModal };

// modal close handlers
document.addEventListener('click', (e)=>{
  const target = e.target;
  if(target && target.matches('[data-close]')) closeModal();
});
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closeModal();
});
