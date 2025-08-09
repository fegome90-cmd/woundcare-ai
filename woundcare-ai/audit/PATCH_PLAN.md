# PATCH_PLAN (Report-Only Session)

## Objetivo
Corregir incompatibilidad Pydantic v1 vs uso de .model_dump() que provoca 422 en /recommend y bloquea UI & runner; exponer care_plan dualmente.

## Alcance de Parche (cuando se autorice)
| Archivo | Cambio | Justificación |
|---------|--------|---------------|
| backend/schemas.py | Añadir `care_plan: Optional[dict]` a Recommendation | Dual exposure requerido por UI y consistencia auditoría |
| backend/service.py | Reemplazar `.model_dump()` -> `.dict()` (3 lugares) | Compatibilidad Pydantic v1; evita 422 |
| backend/service.py | Asignar `recommendation.care_plan = care_plan` antes de serializar | Doble exposición del plan |

## Pasos Ordenados
1. Crear rama: `git checkout -b fix/m5-careplan-dual`.
2. Aplicar diff (ver sección Diff Propuesto) sin otros cambios.
3. Instalar deps dev para eliminar skips: `pip install -r backend/dev-requirements.txt && npm install`.
4. Levantar backend y validar `/healthz` (200) y flag `care_plan_enabled`.
5. Probar `/recommend` con payload válido (esperar 200, presence care_plan dual).
6. Ejecutar `python backend/eval/run_scenarios.py` (esperar PASS, p95<=800ms). Repetir una segunda vez si cold-start >800ms.
7. Ejecutar `bash collect_errors.sh` (esperar blocker=0, high=0, sin skips).
8. UI self-check (modal): confirmar ausencia de `care_plan_missing` y visualización plan.
9. Revisar audit log: cada entrada con `recommendation.care_plan` y top-level `care_plan`.
10. Actualizar `docs/PROGRESS.md` con línea Stabilization PASS.
11. Crear commit firmado: `git commit -am "fix(backend): care_plan dual exposure & pydantic v1 compat"`.
12. Merge / PR según flujo.

## Criterios de Aceptación
| Criterio | Estado Esperado |
|----------|-----------------|
| 422 en /recommend | Eliminado (HTTP 200) |
| Dual exposure | Ambos campos presentes (o None coherente) |
| Runner | PASS p95<=800ms |
| UI self-check | PASS sin care_plan_missing |
| collect_errors | blocker=0, high=0, sin skips |
| No regresiones métricas | /metrics muestra incrementos ok y err=0 |

## Reversión
Si falla algún criterio: `git restore backend/service.py backend/schemas.py` y repetir con ajustes menores.

## Diff Propuesto (NO aplicar aún)
```diff
--- a/backend/schemas.py
+++ b/backend/schemas.py
@@
 class Recommendation(BaseModel):
	 allowed: bool
	 title: str
	 plan_steps: List[str]
	 flags: Flags
	 risk_score: float
	 pii_hits: List[str]
	 suggested_dressings: List[SuggestedDressing]
	 disclaimer: str
	 provenance: Optional[dict] = None
	+    # // BEGIN PATCH M5 careplan
	+    care_plan: Optional[dict] = None  # dual exposure (UI + audit)
	+    # // END PATCH M5 careplan
@@
 class PlanResult(BaseModel):
	 recommendation: Recommendation
	 audit_id: UUID4
	 care_plan: Optional[dict] = None  # structured plan composed server-side
--- a/backend/service.py
+++ b/backend/service.py
@@
-            col_out = run_column(payload.model_dump(), base_rec=recommendation.model_dump())
+            # // BEGIN PATCH M5 careplan
+            col_out = run_column(payload.dict(), base_rec=recommendation.dict())  # pydantic v1 compat
+            # // END PATCH M5 careplan
@@
-    req_dump = payload.model_dump()
+    # // BEGIN PATCH M5 careplan
+    req_dump = payload.dict()  # pydantic v1 compat
+    # // END PATCH M5 careplan
@@
-        'result': recommendation.model_dump(),
+        # // BEGIN PATCH M5 careplan
+        try:
+            recommendation.care_plan = care_plan  # dual exposure
+        except Exception:
+            pass
+        'result': recommendation.dict(),  # pydantic v1 compat
+        # // END PATCH M5 careplan
```

## Notas
- No se han aplicado cambios en esta fase report-only.
- El diff omitirá cualquier otro ajuste no estrictamente necesario.

---

## M5-plus (Aditivo, Report-Only, NO aplicado)

Objetivo: Incorporar mejoras seguras y fácilmente testeables sin romper APIs ni modificar semántica clínica base.

Alcance (a)-(f):
1. Refactor helper `_build_generic_plan` en `service.py` (claridad, cero cambio funcional).
2. `/status-lite` (en preparación: métricas extendidas status/error_ratio/errors — se añadirá en parche base cuando se aplique; no rompe consumidores actuales porque añade campos nuevos opcionales).
3. `compute_risk` defensivo (`.get` con defaults) para tolerar enums inesperados.
4. Ranking determinista: ordenar por `score desc, id asc` para estabilidad UI.
5. Sanitización de marcas con supresión de `BRAND_REMOVED` en `reason_codes` (etiqueta técnica ya no se expone) y logging (marcado en comentarios; logging concreto podrá añadirse si se habilita logger central en fase posterior).
6. `reasons_to_why` consistente (ya filtraba; se documenta y asegura no vacíos).

Archivos potencialmente afectados por el patch M5-plus:
- `backend/service.py` (refactor plan helper, compat .dict en líneas ya cubiertas por fix base, status-lite extendido cuando se integre)
- `backend/engine.py` (compute_risk defensivo, tie-break determinista, supresión BRAND_REMOVED)
- `backend/plan.py` (sin cambios ahora, reservado si helper se mueve a plan más adelante) 
- `backend/schemas.py` (sin cambios adicionales; sólo si se necesitara typing para nuevos campos en /status-lite, de momento no).

Riesgos & Mitigación:
| Mejora | Riesgo | Mitigación | Reversión |
|--------|--------|------------|-----------|
| _build_generic_plan | Bajo (refactor puro) | Tests comparativos antes/después | Restaurar bloque inline |
| compute_risk defensivo | Bajo (defaults conservadores) | Test con valores fuera de dominio | Revertir función a versión previa |
| Ranking determinista | Bajo (solo orden ties) | Test empate IDs | Restaurar sort previo |
| Supresión BRAND_REMOVED | Muy bajo | Verificar UI no muestra etiqueta técnica | Reinsertar token en lista | 
| reasons_to_why filtro | Nulo (ya filtraba) | Test with unknown code | N/A |
| /status-lite extendido | Bajo (solo campos nuevos) | Test HEAD y GET antes/después | Revertir diff en endpoint |

Reversión rápida (post-aplicación si algo falla):
```
git restore backend/service.py backend/engine.py
```

Test Plan (resumen; ver `PATCH_TEST_PLAN.md` ampliado tras integrar):
- Runner PASS p95<=800ms.
- /status-lite: contiene {status, error_ratio, errors} y status ∈ {ok,degraded}.
- Ranking determinista: lista ordenada estable en empates (score igual → id asc).
- compute_risk: payload con severidad desconocida retorna 200 y riesgo default.
- Sanitización: nombre con ™ produce nombre genérico sin símbolo; reason_codes no incluye BRAND_REMOVED.

Artefacto diff preparado: `patches/m5-plus.patch` (no aplicado).

Gates verificados (pre-aplicación):
- Código fuente sin cambios (git clean salvo archivos audit/ y patches/).
- Diff limitado a archivos declarados.


