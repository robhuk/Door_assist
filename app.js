(()=>{'use strict';
const STORE='doorcode_directory_v1';let locations=load(),editingId=null,keypadValue='',keypadTarget=null,toastTimer;const collapsedLocations=new Set();
const $=id=>document.getElementById(id);const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
function load(){try{const v=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function save(){localStorage.setItem(STORE,JSON.stringify(locations));render()}
function stamp(){return new Date().toISOString()}
function fmtDate(v){if(!v)return 'Not recorded';const d=new Date(v);return Number.isNaN(+d)?'Not recorded':d.toLocaleString(undefined,{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2300)}
function render(){
const q=$('search').value.trim().toLowerCase(),root=$('locationList');root.innerHTML='';
const favouritesOnly=$('favouritesFilter').classList.contains('active');
const found=locations.filter(x=>(!favouritesOnly||x.favourite)&&(x.name.toLowerCase().includes(q)||(x.notes||'').toLowerCase().includes(q)||(x.doors||[]).some(d=>(d.name+' '+d.code).toLowerCase().includes(q)))).sort((a,b)=>(Number(!!b.favourite)-Number(!!a.favourite))||a.name.localeCompare(b.name));
$('emptyState').classList.toggle('hidden',locations.length!==0);$('clearSearch').style.display=$('search').value?'block':'none';
found.forEach(loc=>{
const card=document.createElement('article');card.className='location-card';
const collapsed=collapsedLocations.has(loc.id);
const doorRows=(loc.doors||[]).map((d,i)=>`<div class="door-display"><div class="door-display-info"><div class="door-display-name">${esc(d.name||`Door ${i+1}`)}</div><div class="codevalue">${esc(d.code||'—')}</div></div><div class="codebuttons"><button class="codebtn" data-keypad="${loc.id}" data-door="${i}">KEYPAD</button><button class="codebtn secondarycode" data-copy="${loc.id}" data-door="${i}">COPY</button></div></div>`).join('');
card.innerHTML=`<div class="cardtop"><button class="collapsebtn" data-collapse="${loc.id}" aria-expanded="${!collapsed}" aria-label="${collapsed?'Expand':'Collapse'} ${esc(loc.name)}">${collapsed?'▸':'▾'}</button><div class="locationheading"><h3 class="location-title">${esc(loc.name)}</h3><div class="updated">Last updated ${esc(fmtDate(loc.updatedAt))}</div></div><div class="cardactions"><button class="smallicon favouritebtn ${loc.favourite?'is-favourite':''}" data-favourite="${loc.id}" aria-label="${loc.favourite?'Remove from':'Add to'} favourites" title="${loc.favourite?'Remove favourite':'Add favourite'}">${loc.favourite?'★':'☆'}</button><button class="smallicon" data-edit="${loc.id}" aria-label="Edit ${esc(loc.name)}" title="Edit">✎</button></div></div><div class="location-content ${collapsed?'hidden':''}">${doorRows||'<p class="notes">No door codes added yet.</p>'}${loc.notes?`<p class="notes"><strong>Access notes</strong><br>${esc(loc.notes)}</p>`:''}</div>`;
root.appendChild(card)
});
if(q&&found.length===0){const e=document.createElement('div');e.className='empty';e.innerHTML='<h2>No matching locations</h2><p>Try another search term.</p>';root.appendChild(e)}
if(favouritesOnly&&found.length===0&&!q){const e=document.createElement('div');e.className='empty';e.innerHTML='<h2>No favourites saved</h2><p>Tap the star on a location to add it here.</p>';root.appendChild(e)}
}
function openModal(id){$(id).classList.remove('hidden');document.body.style.overflow='hidden'}function closeModal(id){$(id).classList.add('hidden');if(!document.querySelector('.modal:not(.hidden)'))document.body.style.overflow=''}
function doorRow(name='',code=''){const wrap=document.createElement('div');wrap.className='doorrow';wrap.innerHTML=`<div class="doorrowtop"><span>DOOR ENTRY</span><button type="button" class="remove-door">Remove</button></div><div class="doorrowfields"><input class="door-name" maxlength="80" placeholder="Door name (e.g. Main entrance)" value="${esc(name)}" required><input class="door-code codeentry" inputmode="none" autocomplete="off" placeholder="Door code" value="${esc(code)}" required></div>`;wrap.querySelector('.remove-door').onclick=()=>{if($('doorFields').children.length===1){wrap.querySelectorAll('input').forEach(i=>i.value='')}else wrap.remove()};wrap.querySelector('.door-code').addEventListener('focus',e=>{e.target.blur();keypadTarget=e.target;keypadValue=e.target.value;showKeypad(wrap.querySelector('.door-name').value||'Door code')});$('doorFields').appendChild(wrap)}
function startAdd(){editingId=null;$('locationForm').reset();$('doorFields').innerHTML='';doorRow();$('modalTitle').textContent='Add location';$('deleteLocation').classList.add('hidden');openModal('editModal');setTimeout(()=>$('locationName').focus(),100)}
function startEdit(id){const loc=locations.find(x=>x.id===id);if(!loc)return;editingId=id;$('locationForm').reset();$('locationName').value=loc.name;$('locationNotes').value=loc.notes||'';$('doorFields').innerHTML='';(loc.doors||[]).forEach(d=>doorRow(d.name,d.code));if(!loc.doors?.length)doorRow();$('modalTitle').textContent='Edit location';$('deleteLocation').classList.remove('hidden');openModal('editModal')}
function showKeypad(label){$('keypadDoorName').textContent=label;$('keypadDisplay').textContent=keypadValue||' ';openModal('keypadModal')}
function commitKeypad(){if(keypadTarget){keypadTarget.value=keypadValue;keypadTarget.dispatchEvent(new Event('input',{bubbles:true}))}closeModal('keypadModal');keypadTarget=null}
$('useKeypadCode').onclick=commitKeypad;$('addBtn').onclick=startAdd;$('emptyAdd').onclick=startAdd;$('addDoor').onclick=()=>doorRow();$('search').addEventListener('input',render);$('favouritesFilter').onclick=()=>{$('favouritesFilter').classList.toggle('active');$('favouritesFilter').setAttribute('aria-pressed',String($('favouritesFilter').classList.contains('active')));render()};$('clearSearch').onclick=()=>{$('search').value='';render();$('search').focus()};$('settingsBtn').onclick=()=>openModal('settingsModal');
document.addEventListener('click',e=>{const close=e.target.closest('[data-close]');if(close){closeModal(close.dataset.close);return}const edit=e.target.closest('[data-edit]');if(edit){startEdit(edit.dataset.edit);return}const collapse=e.target.closest('[data-collapse]');if(collapse){const id=collapse.dataset.collapse;collapsedLocations.has(id)?collapsedLocations.delete(id):collapsedLocations.add(id);render();return}const fav=e.target.closest('[data-favourite]');if(fav){const loc=locations.find(x=>x.id===fav.dataset.favourite);if(loc){loc.favourite=!loc.favourite;save();toast(loc.favourite?'Added to favourites':'Removed from favourites')}return}const kp=e.target.closest('[data-keypad]');if(kp){const loc=locations.find(x=>x.id===kp.dataset.keypad),i=Number(kp.dataset.door);if(!loc?.doors?.[i])return;if(!confirm('Are you sure you want to edit this code?'))return;keypadTarget=null;keypadValue=loc.doors[i].code||'';showKeypad(loc.doors[i].name||'Door code');return}const cp=e.target.closest('[data-copy]');if(cp){const loc=locations.find(x=>x.id===cp.dataset.copy),code=loc?.doors?.[Number(cp.dataset.door)]?.code||'';if(navigator.clipboard?.writeText)navigator.clipboard.writeText(code).then(()=>toast('Code copied')).catch(()=>toast('Copy unavailable'));else toast('Clipboard unavailable')}});

$('locationForm').addEventListener('submit',e=>{e.preventDefault();const name=$('locationName').value.trim();const doors=[...$('doorFields').querySelectorAll('.doorrow')].map(r=>({id:uid(),name:r.querySelector('.door-name').value.trim(),code:r.querySelector('.door-code').value.trim()})).filter(d=>d.name||d.code);if(!name){toast('Enter a location name');return}if(doors.some(d=>!d.name||!d.code)){toast('Complete or remove each door entry');return}const old=locations.find(x=>x.id===editingId);const item={id:editingId||uid(),name,doors,notes:$('locationNotes').value.trim(),favourite:!!old?.favourite,createdAt:old?.createdAt||stamp(),updatedAt:stamp()};if(old)locations=locations.map(x=>x.id===editingId?item:x);else locations.push(item);save();closeModal('editModal');toast(old?'Location updated':'Location added')});
$('deleteLocation').onclick=()=>{if(!editingId)return;if(!confirm('Delete this location and all its door codes?'))return;locations=locations.filter(x=>x.id!==editingId);save();closeModal('editModal');toast('Location deleted')};
document.querySelectorAll('[data-key]').forEach(b=>b.addEventListener('click',()=>{
const k=b.dataset.key;
if(k==='BACKSPACE'){
  if(keypadValue.endsWith(' CLEAR'))keypadValue=keypadValue.slice(0,-6);
  else if(keypadValue.endsWith(' ENTER'))keypadValue=keypadValue.slice(0,-6);
  else keypadValue=keypadValue.slice(0,-1);
}else if(k==='CLEAR'||k==='ENTER'){
  if(keypadValue.length<64)keypadValue+=(keypadValue?' ':'')+k;
}else if(keypadValue.length<64){
  if((keypadValue.endsWith('CLEAR')||keypadValue.endsWith('ENTER'))&&!keypadValue.endsWith(' '))keypadValue+=' ';
  keypadValue+=k;
}
$('keypadDisplay').textContent=keypadValue||' ';
}));

function exportPdf(){
 if(!locations.length){toast('There are no locations to export');return}
 const rows=[...locations].sort((a,b)=>a.name.localeCompare(b.name)).flatMap(loc=>{
  const doors=loc.doors?.length?loc.doors:[{name:'—',code:'—'}];
  return doors.map((door,i)=>`<tr><td>${esc(loc.name)}</td><td>${esc(door.name||`Door ${i+1}`)}</td><td class="code">${esc(door.code||'—')}</td><td>${esc(loc.notes||'—').replace(/\n/g,'<br>')}</td><td>${esc(fmtDate(loc.updatedAt))}</td></tr>`);
 }).join('');
 const printedAt=new Date().toLocaleString();
 const doc=`<!doctype html><html><head><meta charset="utf-8"><title>XC DoorCode - Door Code Directory</title><style>
 @page{size:A4 landscape;margin:14mm}*{box-sizing:border-box}body{font:10pt Arial,sans-serif;color:#25232a;margin:0}
 header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:4px solid #A50034;padding-bottom:10px;margin-bottom:16px}
 h1{font-size:22pt;margin:0;color:#A50034}.sub,.meta{font-size:9pt;color:#596273}.meta{text-align:right}
 .warning{padding:8px 10px;background:#fff6dc;border-left:4px solid #FFC72C;font-size:8pt}
 table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}tr{break-inside:avoid}
 th{background:#A50034;color:white;text-align:left;padding:8px 7px;font-size:8pt}
 td{border-bottom:1px solid #d9dde3;padding:7px;vertical-align:top;overflow-wrap:anywhere;font-size:8.5pt}
 tbody tr:nth-child(even){background:#f5f6f8}.code{font-family:Consolas,monospace;font-weight:bold;white-space:pre-wrap}
 th:nth-child(1){width:19%}th:nth-child(2){width:17%}th:nth-child(3){width:19%}th:nth-child(4){width:31%}th:nth-child(5){width:14%}
 .foot{margin-top:12px;color:#737d8a;font-size:7.5pt}
 </style></head><body><header><div><h1>XC DoorCode</h1><div class="sub">DOOR ACCESS DIRECTORY · Complete export</div></div><div class="meta">Generated ${esc(printedAt)}<br>${locations.length} location(s) · ${locations.reduce((n,l)=>n+(l.doors||[]).length,0)} door code(s)</div></header>
 <p class="warning">CONFIDENTIAL: This document contains access codes. Store and share it securely.</p>
 <table><thead><tr><th>Location</th><th>Door</th><th>Door code / keypad sequence</th><th>Additional access notes</th><th>Last updated</th></tr></thead><tbody>${rows}</tbody></table>
 <div class="foot">XC DoorCode · In the print dialog choose “Save as PDF”.</div><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));</script></body></html>`;
 const w=window.open('','_blank');if(!w){toast('Allow pop-ups to export PDF');return}
 w.document.open();w.document.write(doc);w.document.close();
}
$('exportPdfBtn').onclick=exportPdf;
$('exportBtn').onclick=()=>{const payload={app:'DoorCode',version:1,exportedAt:stamp(),locations};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`doorcode-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast('Backup exported')};
$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());const incoming=Array.isArray(data)?data:data.locations;if(!Array.isArray(incoming)||incoming.some(x=>!x||typeof x.name!=='string'||!Array.isArray(x.doors)))throw Error('Invalid backup');const clean=incoming.map(x=>({id:String(x.id||uid()),name:String(x.name).slice(0,120),doors:x.doors.map(d=>({id:String(d.id||uid()),name:String(d.name||''),code:String(d.code||'')})),notes:String(x.notes||''),favourite:!!x.favourite,createdAt:x.createdAt||stamp(),updatedAt:x.updatedAt||stamp()}));if(!confirm(`Import ${clean.length} locations? This will replace the current directory.`))return;locations=clean;save();closeModal('settingsModal');toast('Backup imported')}catch(err){alert('Could not import this file. Please select a valid DoorCode JSON backup.')}finally{e.target.value=''}};
if('serviceWorker'in navigator&&location.protocol!=='file:'){
  const hadController=!!navigator.serviceWorker.controller;
  let reloadingForUpdate=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(hadController&&!reloadingForUpdate){reloadingForUpdate=true;window.location.reload();}
  });
  window.addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./xc-doorcode-sw.js',{updateViaCache:'none'});
      await reg.update();
      if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});
    }catch(e){}
  });
}
render();
})();
