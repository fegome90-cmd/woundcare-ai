📌 Copilot — BRIEF DE INTEGRACIÓN (woundcare-ai)

Referencia de contexto Factorio (LRV, VSM, agente–evaluador, métricas): ver docs/FACTORIO_CONTEXT.md

Contexto del repo:
Proyecto woundcare-ai con public/, assets/, js/, components/, server.py. Necesito añadir un módulo Lite de Wound Care AI que no prescriba nada y sólo entregue plan genérico de cuidado + recomendaciones de cobertura usando la evaluación de la herida y la lista de apósitos disponibles. Debe operar con guardrails: PII, políticas fail-closed, scope por paciente, auditoría.

🎯 Objetivo
	•	Añadir un backend liviano (FastAPI) en woundcare-ai/backend/ con:
	•	GET /healthz
	•	POST /recommend → recibe { scope, eval, available_dressings } y devuelve PlanResult con plan genérico (sin marcas ni fármacos, sin dosificación) y disclaimer.
	•	Añadir JS del front en woundcare-ai/js/ que lea los campos del formulario actual y pinte el resultado en el modal #recommendation-modal.

🧱 Contrato de datos (usar estos nombres y tipos)
	•	Scope: { patient_id: string (regex ^[A-Za-z0-9-]{3,64}$), session_id: uuid, requester: 'demo'|'qa'|'clinician' }
	•	Eval:

{
  "wound_type": "ulcer|surgical|burn|other",
  "severity": "low|moderate|high",
  "exudate_level": "none|low|moderate|high",
  "infection_signs": boolean,
  "pain_level": "none|mild|moderate|severe",
  "necrosis": boolean,
  "location": "string?",
  "notes": "string?"   // escanear PII
}


	•	DressingItem:

{
  "id":"string","name":"string",
  "category":"non_occlusive|foam|pad|gauze|film",
  "absorbency":"none|low|moderate|high",
  "occlusive":boolean,"adhesive":boolean
}


	•	Request: { scope, eval, available_dressings: DressingItem[] }
	•	Response (PlanResult):

{
  "recommendation": {
    "allowed": boolean,
    "title": "string",
    "plan_steps": ["..."],
    "flags": { "blocked_content":bool,"contains_only_generic":bool,"pii":bool },
    "risk_score": 0..1,
    "pii_hits": ["EMAIL_ADDRESS","PHONE_NUMBER","CL_RUT", ...],
    "suggested_dressings": [{ "id":"...", "name":"...", "note":"..." }],
    "disclaimer": "Contenido demostrativo ..."
  },
  "audit_id": "uuid"
}



🔒 Guardrails obligatorios (fail-closed)
	1.	PII gate sobre eval.notes: detectar email, teléfono y RUT chileno. Si hay PII → allowed=false.
	2.	Política de texto: bloquear claims absolutas y keywords clínicas (“100% curación”, “garantizado”, “dosis”, “antibiótico”…).
	3.	Scope: validar patient_id con regex ^[A-Za-z0-9-]{3,64}$.
	4.	DEMO_STRICT: si allowed=false → no mostrar plan; devolver ["Revisión manual requerida — demo estricta no muestra plan automático."].

🧠 Lógica del motor (sin IA, sólo reglas seguras)
	•	Riesgo: base por severity (low=.2, moderate=.5, high=.8) + sumas por exudate (+0/.05/.1/.2) + infection_signs (+.15) + necrosis (+.1), acotar a <=1.
	•	Elegibilidad de apósitos:
	•	Si infection_signs=true o severity=high → NO sugerir occlusive=true.
	•	Si exudate_level ∈ {moderate, high} → priorizar absorbency ∈ {moderate, high}.
	•	Si pain_level=severe → evitar adhesive=true.
	•	Selección: ordenar por absorbency (high>moderate>low>none) + bonus category=non_occlusive + penalización si occlusive. Sugerir máximo 3.
	•	Plan genérico:
	•	Base: “Higiene…”, “Registro fotográfico…”, “Educación…”, “Control programado…”, “Derivar a evaluación clínica…”
	•	Si severity=high o infection_signs=true: usar plan prioritario (“Cobertura limpia inmediata no oclusiva”, “Registro fotográfico inmediato”, “Derivar prioritaria”).
	•	Nunca nombres comerciales, fármacos ni dosis.

🗂️ Estructura a crear

woundcare-ai/
  backend/
    requirements.txt
    .env.example         (PORT=8088, APP_MODE=DEMO_STRICT, AUDIT_PATH=./audit/audit_log.jsonl)
    schemas.py  pii.py  policy.py  engine.py  service.py  run.sh
  js/
    dressings.sample.js  api.js  wca-lite.js
  components/
    recommendation-modal.html      (contenedor <div id="recommendation-modal"></div>)

🖥️ UI mapping (usa estos IDs; si no existen, créalos o adapta)
	•	Inputs: #patient-id, #wound-type, #severity, #exudate, #infection (checkbox), #pain, #necrosis (checkbox), #notes
	•	Botón: #btn-generate-plan
	•	Modal destino: #recommendation-modal
	•	Errores: #form-errors (texto)

Carga del script en public/index.html:

<script type="module" src="/js/wca-lite.js"></script>

✅ Aceptación (manual)
	•	GET http://localhost:8088/healthz → {ok:true,mode:'DEMO_STRICT',version:'...'}
	•	Caso oclusivo: infection_signs=true + film occlusive=true en lista ⇒ no aparece en suggested_dressings.
	•	Caso exudado alto: exudate=high con opciones absorbency=high ⇒ se priorizan.
	•	Caso PII: notes con email/RUT ⇒ allowed=false, y en DEMO_STRICT el plan se oculta.
	•	Se escribe audit/audit_log.jsonl por cada request.

🚫 No hacer
	•	Nada de fármacos, dosificaciones, ni promesas (“100% curación”).
	•	No cambiar estilos/CSS globales.
	•	No tocar server.py salvo que sea para agregar un proxy opcional /api/recommend → :8088/recommend.

▶️ Comandos esperados

# Backend
cd woundcare-ai/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
bash run.sh   # levanta en :8088

# Front: abre tu index.html usual; wca-lite.js llama al backend

📦 Datos de prueba rápidos (JS)

// en consola del navegador:
window.__wcaPayload = {
  scope: { patient_id: 'demo-001', session_id: crypto.randomUUID(), requester:'demo' },
  eval: { wound_type:'ulcer', severity:'high', exudate_level:'high', infection_signs:true, pain_level:'moderate', necrosis:false, notes:'' },
  available_dressings: [
    { id:'f1', name:'Film', category:'film', absorbency:'none', occlusive:true, adhesive:true },
    { id:'p1', name:'Pad', category:'pad', absorbency:'moderate', occlusive:false, adhesive:false },
    { id:'fo1', name:'Foam', category:'foam', absorbency:'high', occlusive:false, adhesive:false }
  ]
};
