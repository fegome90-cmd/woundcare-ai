# PATCH_TEST_PLAN (M5 care_plan dual exposure)

Objetivo: Validar que el parche elimina el 422, expone care_plan en ambos lugares y limpia blockers/high.

## Preparación
1. Aplicar parche: `git apply patches/m5-careplan-fix.patch` (o diff inline del PATCH_PLAN).
2. Crear y activar entorno: `python -m venv backend/.venv && source backend/.venv/bin/activate`.
3. Instalar dependencias: `pip install -r backend/requirements.txt && pip install -r backend/dev-requirements.txt`.
4. Instalar front dev deps (si se requiere eslint): `npm install`.

## Verificación Backend
1. `uvicorn backend.service:app --host 127.0.0.1 --port 8088 &` (export WCA_PID=$!).
2. `curl -s http://127.0.0.1:8088/healthz | jq .` -> HTTP 200 y `care_plan_enabled: true`.
3. Request allowed:
```
curl -s -X POST http://127.0.0.1:8088/recommend -H 'Content-Type: application/json' -d '{"scope":{"patient_id":"demo-123","session_id":"550e8400-e29b-41d4-a716-446655440000","requester":"demo"},"eval":{"wound_type":"ulcer","severity":"low","exudate_level":"low","infection_signs":false,"pain_level":"none","necrosis":false,"notes":""},"available_dressings":[{"id":"f1","name":"Film","category":"film","absorbency":"none","occlusive":true,"adhesive":true}]}' | jq .
```
   - Debe devolver 200 y contener `.care_plan` y `.recommendation.care_plan`.
4. Request blocked (inyectar contenido que dispare blocked_content) y validar allowed=false.

## Runner
5. `python backend/eval/run_scenarios.py` -> PASS, capturar p95_ms (<=800). Si primera corrida >800, repetir para confirmar calentamiento.

## UI Self-check
6. `./scripts/serve_front.sh &` (export WCA_FRONT=$!).
7. Abrir página / modal y confirmar pasos del plan visibles, sin error care_plan_missing.
8. (Si existe script auto-check) ejecutar y verificar mensaje PASS.

## Auditoría y Métricas
9. `curl -s http://127.0.0.1:8088/metrics | jq .` -> ok == count, err == 0.
10. Revisar audit log (AUDIT_PATH) -> cada entrada con recommendation.care_plan y top-level care_plan.
11. `bash collect_errors.sh` -> blocker=0, high=0, sin skips.

## Criterios de Aceptación
| Criterio | Resultado esperado |
|----------|--------------------|
| /recommend 422 | Eliminado |
| Dual care_plan | Ambos campos presentes |
| Runner | PASS p95<=800 |
| UI self-check | PASS sin care_plan_missing |
| collect_errors | blocker=0 high=0 sin skips |
| Auditoría | Entradas con dual care_plan |

## Reversión
Si falla algún criterio: `git restore backend/service.py backend/schemas.py` y repetir.

## Evidencia para PROGRESS.md
- Línea Stabilization PASS (p95 valor).
- Resumen ERROR_REPORT (blocker=0 high=0).
- Fragmento JSON muestra dual care_plan.

Fin (report-only, sin aplicar aún).

---

## M5-plus TEST PLAN (Aditivo, se ejecutará tras aplicar fix base + parche M5-plus)

Objetivo adicional: Validar mejoras (a)-(f) sin regresiones.

Casos:
1. Refactor helper: Enviar 2 payloads (low severity sin infección, high severity con infección). Capturar plan_steps antes/después (diff textual exacto).
2. /status-lite extendido: `curl /status-lite` → contiene claves nuevas: status, error_ratio, errors. Forzar error enviando payload inválido 1 vez y repetir para ver error_ratio>0.
3. compute_risk defensivo: Modificar payload severidad="unexpected" y exudate_level="weird" → endpoint responde 200 y risk dentro [0,1].
4. Ranking determinista: Crear dos dressings con mismos atributos y scores; repetir 3 llamadas → orden estable (id asc) y sin inversión.
5. Sanitización marcas: Dressing.name = "MarcaX™ Espuma" → respuesta name= genérico (sin ™) y reason_codes no contiene BRAND_REMOVED; why textual sin token técnico.
6. reasons_to_why filtrado: Inyectar reason code desconocido (simulado) y verificar que por concatenación no aparece fragmento vacío ni separadores dobles.

Métricas:
- Repetir runner (≥30 requests) capturar p95 <=800ms.
- /metrics err==0 tras ronda limpia.

Evidencia para PROGRESS.md:
- Línea "M5-plus (prep)" ya presente (⏳) → luego actualizar a ✅ tras ejecución real.

Rollback específico M5-plus:
```
git restore backend/engine.py backend/service.py
```

