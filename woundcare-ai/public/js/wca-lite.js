import { SAMPLE_DRESSINGS } from './dressings.sample.js';
import { recommendPlan } from './api.js';

function el(id){ return document.getElementById(id); }
function text(id, v){ const n = el(id); if (n) n.textContent = v; }
function showErr(msg){ const c = el('form-errors'); const t = el('form-errors-msg'); if (c && t){ t.textContent = msg; c.classList.remove('hidden'); setTimeout(()=>c.classList.add('hidden'), 4500);} }

function collectScope(){
  const patient = (el('patient-id')?.textContent || el('patient-id')?.value || 'demo-001').trim();
  return {
    patient_id: patient,
    session_id: crypto.randomUUID(),
    requester: 'demo',
  };
}

function collectEval(){
  // Prefer explicit IDs if present
  const explicit = {
    wound_type: el('wound-type')?.value,
    severity: el('severity')?.value,
    exudate_level: el('exudate')?.value,
    infection_signs: el('infection') ? !!el('infection')?.checked : undefined,
    pain_level: el('pain')?.value,
    necrosis: el('necrosis') ? !!el('necrosis')?.checked : undefined,
    location: el('location')?.value,
    notes: el('notes')?.value,
  };

  // Fallback: derive from current TIMERSOP form
  const moisture = document.getElementById('moisture')?.value || '';
  const infectionRadio = document.querySelector('input[name="infection"]:checked')?.value || 'No';
  const painRange = Number(document.getElementById('pain')?.value || 0);
  const tissue = document.getElementById('tissue')?.value || '';
  const odor = Number(document.getElementById('odor')?.value || 0);
  const bleeding = Number(document.getElementById('bleeding')?.value || 0);

  const exudateMap = { '': undefined, 'Bajo':'low', 'Moderado':'moderate', 'Alto':'high' };
  const exudate_level = explicit.exudate_level || exudateMap[moisture] || 'low';

  const pain_level = explicit.pain_level || ((p)=>{
    if (typeof p === 'string') return p;
    if (painRange >= 4) return 'severe';
    if (painRange >= 3) return 'moderate';
    if (painRange >= 1) return 'mild';
    return 'none';
  })();

  const infection_signs = explicit.infection_signs ?? (infectionRadio === 'Si');
  const necrosis = explicit.necrosis ?? (tissue === 'Necrosis');

  // Derive a crude severity if not provided
  const severity = explicit.severity || (()=>{
    let score = 0;
    if (infection_signs) score += 2;
    if (necrosis) score += 2;
    if (exudate_level === 'high') score += 2; else if (exudate_level === 'moderate') score += 1;
    if (pain_level === 'severe') score += 2; else if (pain_level === 'moderate') score += 1;
    if (odor >= 3 || bleeding >= 2) score += 1;
    if (score >= 4) return 'high';
    if (score >= 2) return 'moderate';
    return 'low';
  })();

  return {
    wound_type: explicit.wound_type || 'other',
    severity,
    exudate_level,
    infection_signs,
    pain_level,
    necrosis,
    location: explicit.location || undefined,
    notes: explicit.notes || '',
  };
}

function collectDressings(){
  // In demo, use SAMPLE_DRESSINGS; could be replaced with UI-provided list
  return SAMPLE_DRESSINGS;
}

function renderPlan(result){
  const modal = el('recommendation-modal');
  const content = document.getElementById('recommendation-content');
  if (!modal || !content) return;
  modal.classList.remove('hidden');
  requestAnimationFrame(()=>modal.classList.add('active'));

  const r = result.recommendation;
  if (!r.allowed && (r.plan_steps?.length)){
    // DEMO_STRICT: show only the strict message
    content.innerHTML = `<div class="p-4 bg-amber-50 border border-amber-200 rounded">${r.plan_steps.map(s=>`<p>${s}</p>`).join('')}</div>`;
    return;
  }
  content.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200">${r.title}</h4>
        <span class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">Riesgo: ${(r.risk_score*100|0)}%</span>
      </div>
      <div>
        <h5 class="font-medium text-gray-700">Pasos del plan</h5>
        <ul class="list-disc pl-5 text-sm text-gray-700">${r.plan_steps.map(s=>`<li>${s}</li>`).join('')}</ul>
      </div>
      <div>
        <h5 class="font-medium text-gray-700">Coberturas sugeridas</h5>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${r.suggested_dressings.map(d=>`
            <div class="p-3 rounded border bg-white dark:bg-gray-800">
              <div class="font-semibold">${d.name}</div>
              <div class="text-xs text-gray-600">${d.note||''}</div>
            </div>`).join('')}
        </div>
      </div>
      <p class="text-xs text-gray-500">${r.disclaimer}</p>
      ${result.recommendation.pii_hits?.length?`<div class="text-xs text-red-600">PII detectada: ${result.recommendation.pii_hits.join(', ')}</div>`:''}
    </div>`;
}

async function onGenerate(){
  try{
    const payload = {
      scope: collectScope(),
      eval: collectEval(),
      available_dressings: collectDressings(),
    };
    const result = await recommendPlan(payload);
    renderPlan(result);
  }catch(err){
    showErr('No se pudo generar el plan. Levanta el backend :8088.');
    console.error(err);
  }
}

function bind(){
  const btn = el('btn-generate-plan') || el('recommendation-btn');
  if (btn) btn.addEventListener('click', onGenerate);
}

// Auto-bind on DOM ready
if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', bind);
}else{
  bind();
}
