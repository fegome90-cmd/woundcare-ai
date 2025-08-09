#!/usr/bin/env bash
set -e
mkdir -p public/{components,assets/{css,js},data}
# index
cat > public/index.html <<'HTML'
<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>WoundCare AI</title><script src="https://cdn.tailwindcss.com"></script><link rel="stylesheet" href="/assets/css/app.css"></head><body class="bg-gray-100">
<header id="nav"></header>
<main class="max-w-7xl mx-auto p-6 space-y-6">
  <section id="patient-header"></section>
  <div class="grid grid-cols-12 gap-6">
    <section id="timersop" class="col-span-8"></section>
    <aside id="wound-thumb" class="col-span-4"></aside>
  </div>
</main>
<div id="recommendation-modal"></div>
<script type="module" src="/assets/js/main.js"></script>
</body></html>
HTML
# css
mkdir -p public/assets/css
cat > public/assets/css/app.css <<'CSS'
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
input[type='range']::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;background:#1e3a8a;border:2px solid #fff;border-radius:9999px;box-shadow:0 0 5px rgba(0,0,0,.2);cursor:pointer}
CSS
# components
cat > public/components/nav.html <<'HTML'
<nav class="bg-blue-900 text-white"><div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center"><div class="flex items-center gap-6"><span class="font-bold tracking-wide">WoundCare AI</span><a class="text-gray-300 hover:text-white" href="#">Dashboard</a><a class="text-gray-300 hover:text-white" href="#">Patients</a><a class="text-white font-semibold border-b-2 border-white pb-1" href="#">New Evaluation</a><a class="text-gray-300 hover:text-white" href="#">History</a><a class="text-gray-300 hover:text-white" href="#">Settings</a></div><div class="flex items-center gap-3"><span class="text-gray-300">Victoria Smith</span><div class="w-8 h-8 rounded-full bg-gray-500"></div></div></div></nav>
HTML
cat > public/components/patient-header.html <<'HTML'
<div class="bg-white rounded-xl shadow p-4 flex items-center justify-between"><div class="flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-blue-100"></div><div><h2 class="text-lg font-semibold">Paciente: <span id="ph-name">—</span></h2><p class="text-sm text-gray-600">Última evaluación: <span id="ph-last">—</span> · Hoy: <span id="ph-today">—</span></p></div></div><div><button id="new-patient" class="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200">+ Nuevo paciente</button></div></div>
HTML
cat > public/components/timersop-panel.html <<'HTML'
<div class="bg-white rounded-xl shadow p-5 space-y-5">
  <h3 class="text-xl font-bold">Nueva Evaluación</h3>
  <p class="text-gray-600">Parámetros <strong>TIMERSOP</strong></p>
  <div class="bg-gray-50 p-4 rounded-lg"><label for="tissue" class="block text-sm font-semibold text-gray-700">Tissue</label>
  <select id="tissue" class="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500">
    <option value="">Seleccione tipo de tejido</option><option value="Epitelial">Epitelial</option><option value="Subcutaneo">Subcutáneo</option><option value="Muscular">Muscular</option><option value="Oseo">Óseo</option>
  </select></div>
  <div class="bg-gray-50 p-4 rounded-lg"><span class="block text-sm font-semibold text-gray-700">Infection</span>
    <div class="mt-2 flex gap-6">
      <label class="inline-flex items-center gap-2"><input type="radio" name="infection" value="Si" class="text-blue-600"><span>Sí</span></label>
      <label class="inline-flex items-center gap-2"><input type="radio" name="infection" value="No" class="text-blue-600"><span>No</span></label>
    </div>
  </div>
  <div class="bg-gray-50 p-4 rounded-lg"><label for="moisture" class="block text-sm font-semibold text-gray-700">Moisture</label>
    <select id="moisture" class="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500">
      <option value="">Seleccione nivel de humedad</option><option value="Bajo">Bajo</option><option value="Moderado">Moderado</option><option value="Alto">Alto</option>
    </select>
  </div>
  <div class="bg-gray-50 p-4 rounded-lg"><label for="edge" class="block text-sm font-semibold text-gray-700">Edge</label>
    <select id="edge" class="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500">
      <option value="">Seleccione estado del borde</option><option value="Bien definido">Bien definido</option><option value="Macerado">Macerado</option><option value="Retractil">Retráctil</option>
    </select>
  </div>
  <div class="bg-gray-50 p-4 rounded-lg"><span class="block text-sm font-semibold text-gray-700">Remains</span>
    <div class="mt-2 flex gap-6">
      <label class="inline-flex items-center gap-2"><input type="radio" name="remains" value="Si" class="text-blue-600"><span>Sí</span></label>
      <label class="inline-flex items-center gap-2"><input type="radio" name="remains" value="No" class="text-blue-600"><span>No</span></label>
    </div>
  </div>
  <div class="bg-gray-50 p-4 rounded-lg"><label for="surrounding" class="block text-sm font-semibold text-gray-700">Surrounding Skin</label>
    <select id="surrounding" class="mt-1 block w-full rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500">
      <option value="">Seleccione estado de la piel</option><option value="Intacta">Intacta</option><option value="Macerada">Macerada</option><option value="Eritematosa">Eritematosa</option>
    </select>
  </div>
  <div class="bg-gray-50 p-4 rounded-lg"><label for="odor" class="block text-sm font-semibold text-gray-700">Olor (1–5)</label>
    <input type="range" id="odor" min="1" max="5" value="1" class="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"/>
    <span id="odor-value" class="block text-right text-xs text-gray-500">1</span>
  </div>
  <div class="bg-gray-50 p-4 rounded-lg"><label for="pain" class="block text-sm font-semibold text-gray-700">Pain (1–5)</label>
    <input type="range" id="pain" min="1" max="5" value="1" class="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"/>
    <span id="pain-value" class="block text-right text-xs text-gray-500">1</span>
  </div>
  <button id="recommendation-btn" disabled class="w-full bg-blue-200 text-white font-bold py-3 px-4 rounded-xl shadow transition disabled:opacity-50">Generar Recomendación</button>
</div>
HTML
cat > public/components/wound-thumbnail.html <<'HTML'
<div class="bg-white rounded-xl shadow p-5 space-y-4 text-center"><h4 class="text-lg font-semibold">Miniatura de la herida</h4><img id="wound-thumb-img" src="https://placehold.co/240x240/e2e8f0/4a5568?text=placeholder" alt="Imagen de herida" class="mx-auto rounded-lg shadow" loading="lazy" width="240" height="240"/><div class="flex justify-center"><label class="inline-flex items-center px-4 py-2 rounded bg-blue-500 text-white cursor-pointer hover:bg-blue-600"><input id="wound-upload" type="file" accept="image/*" class="hidden"/>Subir imagen</label></div><p class="text-sm text-gray-500">La imagen completa se revisa en el visor dedicado.</p></div>
HTML
cat > public/components/recommendation-modal.html <<'HTML'
<div class="fixed inset-0 bg-gray-900 bg-opacity-75 hidden items-center justify-center" id="rec-modal-backdrop" role="dialog" aria-modal="true"><div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl"><div class="flex justify-between items-center border-b pb-3 mb-4"><h3 class="text-xl font-bold">Recomendaciones de Tratamiento</h3><button id="rec-close" class="text-gray-400 hover:text-gray-600" aria-label="Cerrar">&times;</button></div><div id="recommendation-content" class="space-y-6"></div><div class="mt-6 flex justify-end"><button id="rec-close-bottom" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Cerrar</button></div></div></div>
HTML
# JS
cat > public/assets/js/ui.js <<'JS'
export async function injectPartial(selector,url){const host=document.querySelector(selector);const res=await fetch(url,{cache:'no-cache'});host.innerHTML=await res.text();}
export function todayISO(){const d=new Date();const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;}
JS
cat > public/assets/js/state.js <<'JS'
export const evaluationState={tissue:'',infection:'',moisture:'',edge:'',remains:'',surrounding:'',odor:1,pain:1};
export function setPatientHeader({name,last,today}){const n=document.getElementById('ph-name');const l=document.getElementById('ph-last');const t=document.getElementById('ph-today');if(n) n.textContent=name||'—';if(l) l.textContent=last||'—';if(t) t.textContent=today||'—';}
JS
cat > public/assets/js/validators.js <<'JS'
import { evaluationState } from './state.js';
export function isComplete(){const s=evaluationState;return !!(s.tissue&&s.infection&&s.moisture&&s.edge&&s.remains&&s.surrounding);}
JS
cat > public/assets/js/recommendation.js <<'JS'
import { fetchJSON } from './services.js';
export async function openModalWithRecommendations(state){
  const products=await fetchJSON('/data/products.json');
  const rules=await fetchJSON('/data/rules.json');
  const tags=[];
  if(state.moisture==='Alto') tags.push('M:Alto');
  if(state.moisture==='Moderado') tags.push('M:Moderado');
  if(state.moisture==='Bajo') tags.push('M:Bajo');
  if(state.infection==='Si') tags.push('Infection:Si');
  if(state.pain>=4) tags.push('Pain:Alto');
  if(tags.length===0) tags.push('General');
  const ruleHits=new Set();
  rules.forEach(r=>{if(r.if.every(t=>tags.includes(t))) r.then.forEach(pid=>ruleHits.add(pid));});
  const scored=products.map(p=>{let score=0;(p.tags||[]).forEach(t=>{if(tags.includes(t)) score+=1;}); if(ruleHits.has(p.id)) score+=2; return {...p,score};}).sort((a,b)=>b.score-a.score).slice(0,5);
  const rec=document.getElementById('recommendation-content');
  const rows=[`<div class="mb-4"><h4 class="font-semibold">Parámetros de Evaluación</h4><div class="grid grid-cols-2 gap-2 text-sm text-gray-700">
    <div><span class="font-semibold">Tissue:</span> ${state.tissue}</div>
    <div><span class="font-semibold">Infection:</span> ${state.infection}</div>
    <div><span class="font-semibold">Moisture:</span> ${state.moisture}</div>
    <div><span class="font-semibold">Edge:</span> ${state.edge}</div>
    <div><span class="font-semibold">Remains:</span> ${state.remains}</div>
    <div><span class="font-semibold">Surrounding:</span> ${state.surrounding}</div>
    <div><span class="font-semibold">Olor:</span> ${state.odor}</div>
    <div><span class="font-semibold">Pain:</span> ${state.pain}</div></div></div>`];
  rows.push(`<h4 class="text-lg font-bold">Productos Recomendados</h4>`);
  scored.forEach(p=>rows.push(`<div class="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center justify-between mb-2"><div><p class="font-semibold text-gray-900">${p.nombre}</p><p class="text-sm text-gray-600">${p.funcion}</p><div class="mt-2 flex flex-wrap gap-2">${(p.tags||[]).map(t=>`<span class="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">${t}</span>`).join('')}</div></div><button class="bg-blue-500 text-white text-xs font-medium py-2 px-4 rounded hover:bg-blue-600">Ficha técnica</button></div>`));
  rec.innerHTML=rows.join('\\n');
  document.getElementById('rec-modal-backdrop')?.classList.remove('hidden');
}
JS
cat > public/assets/js/timersop.js <<'JS'
import { evaluationState } from './state.js';
import { isComplete } from './validators.js';
import { openModalWithRecommendations } from './recommendation.js';
export function initTimersop(){
  ['tissue','moisture','edge','surrounding'].forEach(id=>{
    const el=document.getElementById(id);
    el&&el.addEventListener('change',()=>{evaluationState[id]=el.value;syncCTA();});
  });
  document.querySelectorAll('input[name="infection"]').forEach(r=>r.addEventListener('change',()=>{
    evaluationState.infection=document.querySelector('input[name="infection"]:checked')?.value||''; syncCTA();
  }));
  document.querySelectorAll('input[name="remains"]').forEach(r=>r.addEventListener('change',()=>{
    evaluationState.remains=document.querySelector('input[name="remains"]:checked')?.value||''; syncCTA();
  }));
  const odor=document.getElementById('odor'); const pain=document.getElementById('pain');
  const odorVal=document.getElementById('odor-value'); const painVal=document.getElementById('pain-value');
  odor&&odor.addEventListener('input',()=>{evaluationState.odor=Number(odor.value); if(odorVal) odorVal.textContent=odor.value;});
  pain&&pain.addEventListener('input',()=>{evaluationState.pain=Number(pain.value); if(painVal) painVal.textContent=pain.value;});
  const btn=document.getElementById('recommendation-btn');
  btn&&btn.addEventListener('click',()=>{ if(!btn.disabled) openModalWithRecommendations(evaluationState); });
  syncCTA();
}
function syncCTA(){
  const btn=document.getElementById('recommendation-btn');
  if(!btn) return;
  if(isComplete()){ btn.disabled=false; btn.classList.remove('bg-blue-200'); btn.classList.add('bg-blue-500','hover:bg-blue-600'); }
  else { btn.disabled=true; btn.classList.add('bg-blue-200'); btn.classList.remove('bg-blue-500','hover:bg-blue-600'); }
}
JS
cat > public/assets/js/modal.js <<'JS'
export function initModal(){
  const backdrop=document.getElementById('rec-modal-backdrop');
  ['rec-close','rec-close-bottom'].forEach(id=>{
    const btn=document.getElementById(id);
    btn&&btn.addEventListener('click',()=>backdrop?.classList.add('hidden'));
  });
  backdrop&&backdrop.addEventListener('click',e=>{ if(e.target===backdrop) backdrop.classList.add('hidden'); });
}
JS
cat > public/assets/js/images.js <<'JS'
export function initImages(){
  const input=document.getElementById('wound-upload');
  const img=document.getElementById('wound-thumb-img');
  if(!input||!img) return;
  input.addEventListener('change',()=>{ const file=input.files?.[0]; if(!file) return; const url=URL.createObjectURL(file); img.src=url; });
}
JS
cat > public/assets/js/services.js <<'JS'
export async function fetchJSON(url){ const res=await fetch(url,{cache:'no-cache'}); if(!res.ok) throw new Error(`HTTP ${res.status} en ${url}`); return await res.json(); }
JS
cat > public/assets/js/main.js <<'JS'
import { injectPartial, todayISO } from './ui.js';
import { initTimersop } from './timersop.js';
import { initModal } from './modal.js';
import { initImages } from './images.js';
import { setPatientHeader } from './state.js';
document.addEventListener('DOMContentLoaded', async ()=>{
  await injectPartial('#nav','/components/nav.html');
  await injectPartial('#patient-header','/components/patient-header.html');
  await injectPartial('#timersop','/components/timersop-panel.html');
  await injectPartial('#wound-thumb','/components/wound-thumbnail.html');
  await injectPartial('#recommendation-modal','/components/recommendation-modal.html');
  setPatientHeader({ name:'Paciente de Demo', last:'—', today: todayISO() });
  initTimersop(); initImages(); initModal();
});
JS
# data
cat > public/data/products.json <<'JSON'
[
  {"id":"alg-calcio","nombre":"Alginato de Calcio","funcion":"Alta absorción / hemostasia","tags":["M:Alto","hemostatico"]},
  {"id":"hidrocoloide","nombre":"Apósito Hidrocoloide","funcion":"Mantiene ambiente húmedo / protección","tags":["M:Bajo","M:Moderado"]},
  {"id":"plata-foam","nombre":"Espuma con Plata","funcion":"Antimicrobiano / exudado moderado-alto","tags":["Infection:Si","M:Moderado","M:Alto"]},
  {"id":"silicona-gel","nombre":"Apósito de Silicona con Gel","funcion":"Atraumático / confort","tags":["Pain:Alto"]},
  {"id":"foam-pu","nombre":"Espuma de Poliuretano","funcion":"Gestión estándar de exudado","tags":["General"]}
]
JSON
cat > public/data/rules.json <<'JSON'
[
  {"if":["M:Alto"], "then":["alg-calcio","plata-foam"]},
  {"if":["M:Bajo"], "then":["hidrocoloide"]},
  {"if":["M:Moderado"], "then":["hidrocoloide","plata-foam","foam-pu"]},
  {"if":["Infection:Si"], "then":["plata-foam"]},
  {"if":["Pain:Alto"], "then":["silicona-gel"]},
  {"if":["General"], "then":["foam-pu"]}
]
JSON
echo "OK"
