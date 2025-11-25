const FILES = [
  'src/data/history-edu.json',
  'src/data/history-int.json',
  'src/data/history-proj.json'
];

const contentEl = document.getElementById('content');
const filterEl = document.getElementById('filter');
let ITEMS = [];

function formatDateRange(dateArr){
  if(!Array.isArray(dateArr)) return '';
  const [start,end] = dateArr;
  if(!start) return '';
  return end ? `${start} → ${end}` : `${start}`;
}

function createCard(item){
  const el = document.createElement('article');
  el.className = 'card';

  const title = document.createElement('h3');
  title.textContent = item.title || item.type || 'Untitled';
  el.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = formatDateRange(item.date) + (item.institution?.location || item.company?.location ? ` · ${item.institution?.location || item.company?.location}` : '');
  el.appendChild(meta);

  const inst = item.institution || item.company;
  if(inst){
    const c = document.createElement('div');
    c.className = 'institution';
    const name = inst.url ? `<a href="${inst.url}" target="_blank" rel="noopener">${inst.name}</a>` : inst.name || '';
    c.innerHTML = `<strong>${name}</strong> ${inst.name_short ? `(${inst.name_short})` : ''}`;
    if(inst.short_description){
      const sd = document.createElement('div');
      sd.textContent = inst.short_description;
      c.appendChild(sd);
    }
    el.appendChild(c);
  }

  if(item.description){
    const p = document.createElement('p');
    p.textContent = item.description;
    el.appendChild(p);
  }

  const tags = item.tags || [];
  if(Array.isArray(tags) && tags.length){
    const twrap = document.createElement('div');
    twrap.className = 'tags';
    tags.forEach(t=>{
      const s = document.createElement('span');
      s.className = 'tag';
      s.textContent = t;
      twrap.appendChild(s);
    });
    el.appendChild(twrap);
  }

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

async function loadAll(){
  contentEl.innerHTML = '<div class="no-data">載入中…</div>';
  const all = [];
  for(const f of FILES){
    const data = await tryFetch(f);
    if(data) all.push(...data);
  }
  ITEMS = all;
  render(ITEMS);
}

function render(items){
  contentEl.innerHTML = '';
  if(!items || !items.length){
    contentEl.innerHTML = '<div class="no-data">沒有可顯示的資料</div>';
    return;
  }

  items.sort((a,b)=>{
    const da = a.date && a.date[0] ? a.date[0] : '';
    const db = b.date && b.date[0] ? b.date[0] : '';
    return db.localeCompare(da);
  });

  for(const it of items){
    const c = createCard(it);
    contentEl.appendChild(c);
  }
}

filterEl.addEventListener('input', ()=>{
  const q = filterEl.value.trim().toLowerCase();
  if(!q) return render(ITEMS);
  const filtered = ITEMS.filter(it=>{
    if(it.title && it.title.toLowerCase().includes(q)) return true;
    if(it.description && it.description.toLowerCase().includes(q)) return true;
    const inst = it.institution || it.company;
    if(inst){
      if(inst.name && inst.name.toLowerCase().includes(q)) return true;
      if(inst.short_description && inst.short_description.toLowerCase().includes(q)) return true;
    }
    if(Array.isArray(it.tags) && it.tags.join(' ').toLowerCase().includes(q)) return true;
    return false;
  });
  render(filtered);
});

// initial load
loadAll();

// debug
window.__HISTORY_APP = { loadAll };
