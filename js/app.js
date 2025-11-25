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
  // try to pick an image from item.images or urls
  const img = (item.images && Object.values(item.images).find(Boolean)) || item.image || item.thumbnail || '';
  if(img){ media.style.backgroundImage = `url(${img})`; }
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

function makeCardWithLink(item){
  const card = makeCard(item);
  // wrap clickable behavior
  const wrapper = document.createElement('a');
  wrapper.href = item.urls?.product_website || item.institution?.url || item.company?.url || '#';
  wrapper.target = '_blank'; wrapper.rel='noopener';
  wrapper.appendChild(card);
  return wrapper;
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
window.__HISTORY_APP = { loadAll, ITEMS };
