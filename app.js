(()=>{'use strict';
const STORE='doorcode_directory_v1';let locations=load(),editingId=null,keypadValue='',keypadTarget=null,toastTimer;const collapsedLocations=new Set(locations.map(x=>x.id));
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
const sortOrder=$('sortOrder')?.value||'az';
const found=locations.filter(x=>(!favouritesOnly||x.favourite)&&(x.name.toLowerCase().includes(q)||(x.notes||'').toLowerCase().includes(q)||(x.doors||[]).some(d=>(d.name+' '+d.code).toLowerCase().includes(q)))).sort((a,b)=>{
 const favouriteOrder=Number(!!b.favourite)-Number(!!a.favourite);
 if(favouriteOrder)return favouriteOrder;
 if(sortOrder==='updated'){
  const dateA=Date.parse(a.updatedAt||a.createdAt||0)||0,dateB=Date.parse(b.updatedAt||b.createdAt||0)||0;
  return dateB-dateA||a.name.localeCompare(b.name);
 }
 return a.name.localeCompare(b.name,undefined,{sensitivity:'base'});
});
$('emptyState').classList.toggle('hidden',locations.length!==0);$('clearSearch').style.display=$('search').value?'block':'none';
found.forEach(loc=>{
const card=document.createElement('article');card.className='location-card';
const collapsed=collapsedLocations.has(loc.id);
const doorRows=(loc.doors||[]).map((d,i)=>`<div class="door-display"><div class="door-display-info"><div class="door-display-name">${esc(d.name||`Door ${i+1}`)}</div><div class="codevalue">${esc(d.code||'—')}</div>${d.note?`<p class="doornote"><strong>Door note:</strong> ${esc(d.note)}</p>`:''}</div> </div>`).join('');
card.innerHTML=`<div class="cardtop"><button class="collapsebtn" data-collapse="${loc.id}" aria-expanded="${!collapsed}" aria-label="${collapsed?'Expand':'Collapse'} ${esc(loc.name)}">${collapsed?'▸':'▾'}</button><div class="locationheading"><h3 class="location-title">${esc(loc.name)}</h3><div class="updated">Last updated ${esc(fmtDate(loc.updatedAt))}</div></div><div class="cardactions"><button class="smallicon favouritebtn ${loc.favourite?'is-favourite':''}" data-favourite="${loc.id}" aria-label="${loc.favourite?'Remove from':'Add to'} favourites" title="${loc.favourite?'Remove favourite':'Add favourite'}">${loc.favourite?'★':'☆'}</button><div class="location-menu-wrap"><button class="smallicon menu-trigger" data-menu="${loc.id}" aria-label="More options for ${esc(loc.name)}" aria-expanded="false" title="More options">⋮</button><div class="location-menu hidden" data-menu-panel="${loc.id}"><button type="button" data-copy-all="${loc.id}">Copy</button><button type="button" data-export-jpeg="${loc.id}">Export JPEG</button><button type="button" data-edit="${loc.id}">Edit</button><button type="button" class="danger-menu" data-delete="${loc.id}">Delete</button></div></div></div></div><div class="location-content ${collapsed?'hidden':''}">${doorRows||'<p class="notes">No door codes added yet.</p>'}${loc.notes?`<p class="notes"><strong>Access notes</strong><br>${esc(loc.notes)}</p>`:''}</div>`;
root.appendChild(card)
});
if(q&&found.length===0){const e=document.createElement('div');e.className='empty';e.innerHTML='<h2>No matching locations</h2><p>Try another search term.</p>';root.appendChild(e)}
if(favouritesOnly&&found.length===0&&!q){const e=document.createElement('div');e.className='empty';e.innerHTML='<h2>No favourites saved</h2><p>Tap the star on a location to add it here.</p>';root.appendChild(e)}
}
function openModal(id){$(id).classList.remove('hidden');document.body.style.overflow='hidden'}function closeModal(id){$(id).classList.add('hidden');if(!document.querySelector('.modal:not(.hidden)'))document.body.style.overflow=''}
function doorRow(name='',code='',note=''){const wrap=document.createElement('div');wrap.className='doorrow';wrap.innerHTML=`<div class="doorrowtop"><span>DOOR ENTRY</span><button type="button" class="remove-door">Remove</button></div><div class="doorrowfields"><input class="door-name" maxlength="80" placeholder="Door name (e.g. Main entrance)" value="${esc(name)}" required><input class="door-code codeentry" inputmode="none" autocomplete="off" placeholder="Door code" value="${esc(code)}" required></div><textarea class="door-note" rows="2" placeholder="Note for this door (optional)">${esc(note)}</textarea>`;wrap.querySelector('.remove-door').onclick=()=>{if($('doorFields').children.length===1){wrap.querySelectorAll('input,textarea').forEach(i=>i.value='')}else wrap.remove()};wrap.querySelector('.door-code').addEventListener('focus',e=>{e.target.blur();keypadTarget=e.target;keypadValue=e.target.value;showKeypad(wrap.querySelector('.door-name').value||'Door code')});$('doorFields').appendChild(wrap)}
function startAdd(){editingId=null;$('locationForm').reset();$('doorFields').innerHTML='';doorRow();$('modalTitle').textContent='Add location';$('deleteLocation').classList.add('hidden');openModal('editModal');setTimeout(()=>$('locationName').focus(),100)}
function startEdit(id){const loc=locations.find(x=>x.id===id);if(!loc)return;editingId=id;$('locationForm').reset();$('locationName').value=loc.name;$('locationNotes').value=loc.notes||'';$('doorFields').innerHTML='';(loc.doors||[]).forEach(d=>doorRow(d.name,d.code,d.note||''));if(!loc.doors?.length)doorRow();$('modalTitle').textContent='Edit location';$('deleteLocation').classList.remove('hidden');openModal('editModal')}
function showKeypad(label){$('keypadDoorName').textContent=label;$('keypadDisplay').textContent=keypadValue||' ';openModal('keypadModal')}
function commitKeypad(){if(keypadTarget){keypadTarget.value=keypadValue;keypadTarget.dispatchEvent(new Event('input',{bubbles:true}))}closeModal('keypadModal');keypadTarget=null}
$('useKeypadCode').onclick=commitKeypad;$('addBtn').onclick=startAdd;$('emptyAdd').onclick=startAdd;$('addDoor').onclick=()=>doorRow();$('search').addEventListener('input',render);$('sortOrder').addEventListener('change',render);$('favouritesFilter').onclick=()=>{$('favouritesFilter').classList.toggle('active');$('favouritesFilter').setAttribute('aria-pressed',String($('favouritesFilter').classList.contains('active')));render()};$('clearSearch').onclick=()=>{$('search').value='';render();$('search').focus()};$('settingsBtn').onclick=()=>openModal('settingsModal');

async function exportLocationJpeg(id){
 const loc=locations.find(x=>x.id===id);if(!loc)return;
 const width=1400,pad=76,inner=width-pad*2,lineGap=34;
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 const font='28px Arial',smallFont='23px Arial',codeFont='bold 30px Consolas, monospace';
 ctx.font=font;
 function wrap(text,maxWidth,fontSpec=font){
  ctx.font=fontSpec;const words=String(text||'').split(/\s+/);const lines=[];let line='';
  for(const word of words){const test=line?line+' '+word:word;if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=word}else line=test}
  if(line)lines.push(line);return lines.length?lines:[''];
 }
 const items=(loc.doors||[]).length?loc.doors:[{name:'No door entries',code:'',note:''}];
 let height=320;
 const layouts=items.map((d,i)=>{
  const nameLines=wrap(d.name||`Door ${i+1}`,inner*.45,'bold 27px Arial');
  const codeLines=wrap(d.code||'—',inner*.48,codeFont);
  const noteLines=d.note?wrap('NOTE: '+d.note,inner-48,smallFont):[];
  const h=40+Math.max(nameLines.length*34,codeLines.length*38)+noteLines.length*31+30;
  height+=h+18;return {d,nameLines,codeLines,noteLines,h};
 });
 const locationNoteLines=loc.notes?wrap('LOCATION NOTES: '+loc.notes,inner-50,smallFont):[];
 if(locationNoteLines.length)height+=locationNoteLines.length*31+70;
 height+=110;
 canvas.width=width;canvas.height=height;
 ctx.fillStyle='#f4f5f7';ctx.fillRect(0,0,width,height);
 ctx.fillStyle='#A50034';ctx.fillRect(0,0,width,210);
 ctx.fillStyle='#FFC72C';ctx.fillRect(0,210,width,10);
 ctx.fillStyle='#fff';ctx.font='bold 25px Arial';ctx.fillText('XC DOORCODE  /  ACCESS DIRECTORY',pad,70);
 ctx.font='bold 54px Arial';
 let titleLines=wrap(loc.name,inner,'bold 54px Arial');
 let ty=140;titleLines.forEach(line=>{ctx.fillText(line,pad,ty);ty+=58});
 ctx.fillStyle='#596273';ctx.font='22px Arial';
 ctx.fillText('Exported '+new Date().toLocaleString(),pad,260);
 let y=310;
 layouts.forEach(({d,nameLines,codeLines,noteLines,h},i)=>{
  ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(pad,y,width-pad*2,h-12,18);ctx.fill();
  ctx.fillStyle='#A50034';ctx.fillRect(pad,y,9,h-12);
  let yy=y+42;ctx.fillStyle='#25232a';ctx.font='bold 27px Arial';
  nameLines.forEach(line=>{ctx.fillText(line,pad+32,yy);yy+=34});
  let cy=y+42;ctx.fillStyle='#A50034';ctx.font=codeFont;
  codeLines.forEach(line=>{ctx.fillText(line,width-pad-32-ctx.measureText(line).width,cy);cy+=38});
  if(noteLines.length){ctx.fillStyle='#596273';ctx.font=smallFont;let ny=y+h-18-noteLines.length*31;noteLines.forEach(line=>{ctx.fillText(line,pad+32,ny);ny+=31})}
  y+=h+18;
 });
 if(locationNoteLines.length){
  const h=locationNoteLines.length*31+45;ctx.fillStyle='#fff6dc';ctx.fillRect(pad,y,width-pad*2,h);
  ctx.fillStyle='#6b5310';ctx.font=smallFont;let ny=y+36;locationNoteLines.forEach(line=>{ctx.fillText(line,pad+24,ny);ny+=31});
 }
 ctx.fillStyle='#7b8490';ctx.font='18px Arial';ctx.fillText('CONFIDENTIAL — Store and share access codes securely.',pad,canvas.height-32);
 const dataUrl=canvas.toDataURL('image/jpeg',0.94);
 const filename=`doorcode-${loc.name.trim().replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'location'}.jpg`;
 $('jpegPreviewImage').src=dataUrl;
 $('jpegPreviewImage').alt=`Door access codes for ${loc.name}`;
 $('jpegPreviewTitle').textContent=loc.name;
 $('saveJpegBtn').onclick=async()=>{
  const button=$('saveJpegBtn');
  const originalLabel=button.textContent;
  button.disabled=true;
  button.textContent='Preparing JPEG…';
  try{
   const blob=await (await fetch(dataUrl)).blob();
   const file=new File([blob],filename,{type:'image/jpeg',lastModified:Date.now()});
   if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
    try{
     await navigator.share({files:[file],title:`${loc.name} — Door access codes`,text:'Door access directory image'});
     toast('Choose “Save Image” to add it to Photos');
    }catch(error){
     if(error.name!=='AbortError')throw error;
    }
   }else{
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1500);
    toast(/iPhone|iPad|iPod/.test(navigator.userAgent)?'Use Share, then Save Image to add it to Photos':'JPEG downloaded');
   }
  }catch(error){
   const a=document.createElement('a');a.href=dataUrl;a.download=filename;
   document.body.appendChild(a);a.click();a.remove();
   toast('JPEG downloaded');
  }finally{
   button.disabled=false;
   button.textContent=originalLabel;
  }
 };
 openModal('jpegPreviewModal');
}

document.addEventListener('click',e=>{const close=e.target.closest('[data-close]');if(close){closeModal(close.dataset.close);return}
document.querySelectorAll('.location-menu:not(.hidden)').forEach(menu=>{if(!menu.parentElement.contains(e.target))menu.classList.add('hidden')});
const menuTrigger=e.target.closest('[data-menu]');if(menuTrigger){const panel=document.querySelector(`[data-menu-panel="${menuTrigger.dataset.menu}"]`);if(panel){const opening=panel.classList.contains('hidden');document.querySelectorAll('.location-menu').forEach(m=>m.classList.add('hidden'));panel.classList.toggle('hidden',!opening);menuTrigger.setAttribute('aria-expanded',String(opening))}return}
const jpeg=e.target.closest('[data-export-jpeg]');if(jpeg){jpeg.closest('.location-menu')?.classList.add('hidden');exportLocationJpeg(jpeg.dataset.exportJpeg);return}
const del=e.target.closest('[data-delete]');if(del){const loc=locations.find(x=>x.id===del.dataset.delete);if(!loc)return;if(!confirm(`Delete "${loc.name}" and all its door codes?`))return;locations=locations.filter(x=>x.id!==loc.id);save();toast('Location deleted');return}
const edit=e.target.closest('[data-edit]');if(edit){startEdit(edit.dataset.edit);return}const collapse=e.target.closest('[data-collapse]');if(collapse){const id=collapse.dataset.collapse;collapsedLocations.has(id)?collapsedLocations.delete(id):collapsedLocations.add(id);render();return}const fav=e.target.closest('[data-favourite]');if(fav){const loc=locations.find(x=>x.id===fav.dataset.favourite);if(loc){loc.favourite=!loc.favourite;save();toast(loc.favourite?'Added to favourites':'Removed from favourites')}return}const all=e.target.closest('[data-copy-all]');if(all){all.closest('.location-menu')?.classList.add('hidden');const loc=locations.find(x=>x.id===all.dataset.copyAll);if(!loc)return;const text=[loc.name,...(loc.doors||[]).flatMap((d,i)=>[`${d.name||`Door ${i+1}`}: ${d.code||'—'}`,...(d.note?[`  Door note: ${d.note}`]:[])]),...(loc.notes?[`Access notes: ${loc.notes}`]:[])].join('\\n');if(navigator.clipboard?.writeText)navigator.clipboard.writeText(text).then(()=>toast('All location details copied')).catch(()=>toast('Copy unavailable'));else toast('Clipboard unavailable');return}});

$('locationForm').addEventListener('submit',e=>{e.preventDefault();const name=$('locationName').value.trim();const doors=[...$('doorFields').querySelectorAll('.doorrow')].map(r=>({id:uid(),name:r.querySelector('.door-name').value.trim(),code:r.querySelector('.door-code').value.trim(),note:r.querySelector('.door-note').value.trim()})).filter(d=>d.name||d.code||d.note);if(!name){toast('Enter a location name');return}if(doors.some(d=>!d.name||!d.code)){toast('Complete or remove each door entry');return}const old=locations.find(x=>x.id===editingId);const item={id:editingId||uid(),name,doors,notes:$('locationNotes').value.trim(),favourite:!!old?.favourite,createdAt:old?.createdAt||stamp(),updatedAt:stamp()};if(old)locations=locations.map(x=>x.id===editingId?item:x);else locations.push(item);save();closeModal('editModal');toast(old?'Location updated':'Location added')});
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
  return doors.map((door,i)=>`<tr><td>${esc(loc.name)}</td><td>${esc(door.name||`Door ${i+1}`)}</td><td class="code">${esc(door.code||'—')}</td><td>${esc(door.note||'—').replace(/\n/g,'<br>')}</td><td>${esc(fmtDate(loc.updatedAt))}</td></tr>`);
 }).join('');
 const printedAt=new Date().toLocaleString();
 const doc=`<!doctype html><html><head><meta charset="utf-8"><title>Door Access Directory</title><style>
 @page{size:A4 landscape;margin:14mm}*{box-sizing:border-box}body{font:10pt Arial,sans-serif;color:#25232a;margin:0}
 header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:4px solid #A50034;padding-bottom:10px;margin-bottom:16px}
 h1{font-size:22pt;margin:0;color:#A50034}.sub,.meta{font-size:9pt;color:#596273}.meta{text-align:right}
 .warning{padding:8px 10px;background:#fff6dc;border-left:4px solid #FFC72C;font-size:8pt}
 table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}tr{break-inside:avoid}
 th{background:#A50034;color:white;text-align:left;padding:8px 7px;font-size:8pt}
 td{border-bottom:1px solid #d9dde3;padding:7px;vertical-align:top;overflow-wrap:anywhere;font-size:8.5pt}
 tbody tr:nth-child(even){background:#f5f6f8}.code{font-family:Consolas,monospace;font-weight:bold;white-space:pre-wrap}
 th:nth-child(1){width:20%}th:nth-child(2){width:18%}th:nth-child(3){width:20%}th:nth-child(4){width:27%}th:nth-child(5){width:15%}
 .foot{margin-top:12px;color:#737d8a;font-size:7.5pt}
 </style></head><body><header><div><h1>DOOR ACCESS DIRECTORY</h1><div class="sub">ACCESS CODE REGISTER</div></div><div class="meta">Generated ${esc(printedAt)}<br>${locations.length} location(s) · ${locations.reduce((n,l)=>n+(l.doors||[]).length,0)} door code(s)</div></header>
 <p class="warning"><strong>CONFIDENTIAL — SECURITY NOTICE:</strong> This document contains access codes. Store and share it securely. Access codes should be changed regularly and whenever security may have been compromised.</p>
 <table><thead><tr><th>Location</th><th>Door</th><th>Door code / keypad sequence</th><th>Door-specific note</th><th>Last updated</th></tr></thead><tbody>${rows}</tbody></table>
 <div class="foot">CONFIDENTIAL ACCESS INFORMATION</div></body></html>`;
 const blob=new Blob([doc],{type:'text/html;charset=utf-8'});
 const filename=`door-access-directory-${new Date().toISOString().slice(0,10)}.pdf`;
 const modal=$('pdfPreviewModal');
 const frame=$('pdfPreviewFrame');
 const share=$('sharePdfBtn');
 const save=$('savePdfBtn');
 const close=$('closePdfPreviewBtn');
 if(!modal||!frame||!share||!save||!close){toast('PDF preview is unavailable');return}
 if(window._doorcodePdfUrl)URL.revokeObjectURL(window._doorcodePdfUrl);
 window._doorcodePdfUrl=URL.createObjectURL(blob);
 frame.srcdoc=doc;
 modal.classList.remove('hidden');
 share.onclick=()=>downloadPdfHtmlPrint(doc);
 save.onclick=()=>downloadPdfHtmlPrint(doc);
 close.onclick=()=>{modal.classList.add('hidden');frame.srcdoc='';if(window._doorcodePdfUrl){URL.revokeObjectURL(window._doorcodePdfUrl);window._doorcodePdfUrl=null}};
}
function downloadPdfHtmlPrint(doc){
 const w=window.open('','_blank');
 if(!w){toast('Allow pop-ups to create or save the PDF');return}
 w.document.open();w.document.write(doc.replace('</body>','<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),250));</script></body>'));w.document.close();
}
$('exportPdfBtn').onclick=exportPdf;
$('exportBtn').onclick=()=>{const payload={app:'DoorCode',version:1,exportedAt:stamp(),locations};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`doorcode-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast('Backup exported')};
$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());const incoming=Array.isArray(data)?data:data.locations;if(!Array.isArray(incoming)||incoming.some(x=>!x||typeof x.name!=='string'||!Array.isArray(x.doors)))throw Error('Invalid backup');const clean=incoming.map(x=>({id:String(x.id||uid()),name:String(x.name).slice(0,120),doors:x.doors.map(d=>({id:String(d.id||uid()),name:String(d.name||''),code:String(d.code||''),note:String(d.note||'')})),notes:String(x.notes||''),favourite:!!x.favourite,createdAt:x.createdAt||stamp(),updatedAt:x.updatedAt||stamp()}));if(!confirm(`Import ${clean.length} locations? This will replace the current directory.`))return;locations=clean;save();closeModal('settingsModal');toast('Backup imported')}catch(err){alert('Could not import this file. Please select a valid DoorCode JSON backup.')}finally{e.target.value=''}};
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

// Device-local PIN gate. Only a salted SHA-256 verifier is stored, never the PIN.
const PIN_STORE='doorcode_pin_v1';
function pinHex(bytes){return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
function pinSalt(){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);return pinHex(bytes)}
async function pinHash(pin,salt){const data=new TextEncoder().encode(salt+':'+pin);return pinHex(new Uint8Array(await crypto.subtle.digest('SHA-256',data)))}
async function showPinGate(){
 const saved=localStorage.getItem(PIN_STORE),isSetup=!saved;
 $('pinGateTitle').textContent=isSetup?'Set your app PIN':'Enter your PIN';
 $('pinGateMessage').textContent=isSetup?'Create a 4–8 digit PIN to protect access to this directory.':'Enter your PIN to unlock XC DoorCode.';
 $('pinConfirmWrap').classList.toggle('hidden',!isSetup);$('pinConfirm').required=isSetup;
 $('pinInput').value='';$('pinConfirm').value='';$('pinError').textContent='';
 $('pinSubmit').textContent=isSetup?'Set PIN':'Unlock';
 $('pinInput').setAttribute('autocomplete',isSetup?'new-password':'current-password');
 $('pinGate').classList.remove('hidden');setTimeout(()=>$('pinInput').focus(),80);
}
$('pinForm').addEventListener('submit',async e=>{
 e.preventDefault();const pin=$('pinInput').value;
 if(!/^\d{4,8}$/.test(pin)){$('pinError').textContent='Enter a PIN containing 4–8 digits.';return}
 const saved=localStorage.getItem(PIN_STORE);
 if(!saved){
  if(pin!==$('pinConfirm').value){$('pinError').textContent='The PINs do not match.';return}
  const salt=pinSalt();localStorage.setItem(PIN_STORE,JSON.stringify({salt,hash:await pinHash(pin,salt)}));
 }else{
  let record;try{record=JSON.parse(saved)}catch{}
  if(!record||!record.salt||!record.hash||await pinHash(pin,record.salt)!==record.hash){
   $('pinError').textContent='Incorrect PIN. Try again.';$('pinInput').value='';$('pinInput').focus();return;
  }
 }
 $('pinGate').classList.add('hidden');$('pinInput').value='';$('pinConfirm').value='';
});
$('lockAppBtn').onclick=()=>{closeModal('settingsModal');showPinGate()};

showPinGate();
render();
})();
