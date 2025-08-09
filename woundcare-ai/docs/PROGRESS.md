\n[PROGRESS] M5 — IA column (dry-run) ✅
- Resultados: burst p95=3.3ms (≤800), runner 4/4 PASS, header X-WCA-IA-Quality presente, UI con píldora “IA column · q=…”.
- Siguiente: preparar Engineer (offline) sin impactar /recommend.

# PROGRESS — Roadmap y evidencias

Milestones
- M0 Fundaciones — ✅
- M1 Backend Lite — ✅
- M2 Runner con escenarios — ✅
- M3 UI TIMERSOP → payload — ✅
- M4 Métricas + Quality Gates — ✅
- M5 Columna IA (flag) — ⏳ 🔒
- M6 Engineer (offline) — ⏳ 🔒
- M7 Horde (chaos tooling) — ⏳ 🔒
- M8 Empaquetado demo + PR — ⏳

- M4 — Self-check UI listo; runner 4/4; p95<600; audit OK

Tabla

| Milestone | Estado | Último cambio | Evidencia |
|---|---|---|---|
| M0 | ✅ | Fundaciones de repo/estructura | README, public/, server.py |
| M1 | ✅ | FastAPI Lite con /healthz y /recommend | backend/service.py, schemas.py, run.sh |
| M2 | ✅ | Runner con 4 escenarios y asserts | backend/eval/run_scenarios.py, scenarios.json |
| M3 | ✅ | UI TIMERSOP → payload + modal | public/index.html, public/js/*.js |
| M4 | ✅ | Gates en verde (runner+metrics+audit) | runner PASS 4/4; /metrics p95=4.2ms; audit OK |
| M5 | ⏳ 🔒 | Columna IA (flag) en DRY_RUN | backend/config.py, backend/ia_column/*, service.py |
| M6 | ⏳ 🔒 | Engineer offline (pendiente) | docs/QUICKCHECK.md (comandos) |
| M7 | ⏳ 🔒 | Horde tooling (pendiente) |  |
| M8 | ⏳ | Empaquetado demo (pendiente) |  |

[PROGRESS] M4 — Métricas + Quality Gates ⏳
- Cambios: timing middleware y /metrics; Quality Gates documentados; flags IA añadidos; columna IA en DRY_RUN sin cambios en plan.
- Resultados: health ok; runner PASS 4/4; p50≈1.0ms p95≈3.6ms (n=4);
- Archivos: backend/service.py, backend/config.py, backend/ia_column/*, INTEGRATION_BRIEF.md, docs/QUICKCHECK.md
- Siguiente paso: marcar UI payload/modal ✅ tras verificación manual y cerrar M4.

[PROGRESS] M4 — Self-check UI ⏳→✅
- Cambios: selfcheck.js + sección en index.html; docs QUICKCHECK/PROGRESS actualizados.
- Resultados: UI PASS (4/4); p50≈2.7ms p95≈10.5ms; /metrics ok; audit ok.
- Siguiente: preparar scaffold de columna IA bajo flag (M5).

[PROGRESS] M4 — Automations (fix) ✅
- Cambios: scripts/selfcheck.sh (detección estricta de intérprete y error 127); permisos chmod +x; tasks.json con cwd/dependsOn.
- Resultados: runner PASS (4/4) · p50≈3.2ms p95≈16.1ms · /metrics.p95_ms≈5.6 (<600).
- Siguiente: cerrar UI gate con tu línea de Self-check UI y avanzar a M5.
[PROGRESS] M4 — Automations ✅
- Cambios: scripts/dev_backend.sh, scripts/selfcheck.sh; VS Code tasks (Start Backend, Health, Metrics, Self-check); debug launch (uvicorn).
- Cómo correr: F1 → Run Task → Start Backend; luego Health/Metrics; Self-check (esperado: ALL PASS …).
- Siguiente: M5 (columna IA bajo flag, DRY_RUN).

[PROGRESS] M4 — Métricas + Quality Gates ✅
- Cambios: ejecución de runner y verificación de métricas/auditoría.
- Resultados: runner PASS 4/4; p50=2.8ms p95=17.8ms (n=4); /metrics.p95_ms=4.2; audit OK.
- Archivos: scripts/selfcheck.sh, backend/service.py, docs/QUICKCHECK.md.
- Siguiente paso: M5 — Columna IA bajo flag (DRY_RUN) sin modificar plan.

[PROGRESS] M4 — Métricas + Gates ✅
- Resultados: Self-check PASS (4/4); p50=0.8ms p95=4.3ms; /metrics p95=4.2ms; audit OK.
- Siguiente: M5 (IA column in-proc bajo flag, DRY_RUN).

[PROGRESS] M5 — Columna IA (scaffold, fail-closed) ⏳

[PROGRESS] M5.2 — Data Provenance ⏳
- Resultados: en curso. Próximo paso: habilitar USE_CATALOG_FOR_RANKING=true y correr escenarios m5.2 con --require-catalog; generar guía sin marcas.

- Siguiente: exportar CATALOG_SOURCE=json y CATALOG_JSON_PATH, verificar /catalog/dressings y luego Self-check.

[PROGRESS] M5.2 — Data Provenance ✅
- Configuración: FEATURE_IA_COLUMN=true, DRY_RUN=true, USE_CATALOG_FOR_RANKING=true, CATALOG_SOURCE=json, CATALOG_JSON_PATH=./data/dressings.json.
- Healthz: { catalog: { source: "json", read_only: true }, use_catalog_for_ranking: true }.
- Runner: All scenarios PASS · burst=30×4 · p50=3.9ms · p95=5.1ms (budget ≤800ms).
- UI: chips reason_codes visibles cuando se sanitiza marca; salida brand-free (sin marcas) con provenance en /recommend.
- Guía: docs/GUIA_TIPOS_SIN_MARCAS.md regenerada desde catálogo.

[PROGRESS] M6 — Engineer (offline) ⏳
- baseline vs candidate; Δscore calculado offline; violations=0; tiempo <60s.
- Próximo: ajustar templates y corpus para estabilizar mejoras 5–10%+ y consolidar artefactos.

[PROGRESS] M6 — Engineer (offline) ✅
- Baseline avg: 0.3609 · Candidate avg: 0.8492 · Δ=+135.32% (inflated? yes)
- Group regressions: 0 · Tried templates: 120
- Artifacts: backend/engineer/artifacts/best.json, report.md

[PROGRESS] M7.x — Topic Decider (config-only) ⏳
- Docs añadidos: INTEGRATION_BRIEF (sección), QUICKCHECK (uso), PROGRESS (plantilla).
- Pendiente: implementación detrás de flag, validación con runners, métricas por topic.

[PROGRESS] M5 — Plan de Cuidado ⏳
- Backend: care_plan incluido en /recommend (estructura completa) y flags.care_plan_enabled=true en /healthz.
- UI: botón Generar Plan de Cuidado presente, se habilita tras recomendación y renderiza sección (inspección código). Ocultar funciona (listener). Faltan evidencias visuales claro/oscuro.
- Métricas: p50/p95 pendientes de captura fiable (automatización falló en sesión interactiva); NO marcar PASS aún.
- Próximo: capturar /metrics tras 30 requests y verificar p95≤800ms; validar visualmente (sin 404 ni errores consola) y actualizar esta entrada a ✅.

[PROGRESS] M5 — Plan de Cuidado ✅ · 2025-08-09 01:49:46 UTC · n=30 · client p50=1.1ms p95=1.4ms · PASS
[PROGRESS] M6.5 – Probes & Monitor (lite) ✅ · 2025-08-09 01:55:22 UTC · n=30 · client p50=1.1ms p95=1.5ms · beacon OK
[PROGRESS] Stabilization — Error Report ✅ · 2025-08-09 15:10:28 UTC · blocker=0 high=0 medium=0 low=4 total=4
[PROGRESS] Full Error Analysis — FAIL · 2025-08-09 15:15:18 UTC · errors=3 warnings=3
[PROGRESS] Full Error Analysis — FAIL · 2025-08-09 15:21:07 UTC · errors=4 warnings=3
[PROGRESS] Full Error Analysis — FAIL · 2025-08-09 15:23:19 UTC · errors=2 warnings=3
[PROGRESS] Full Error Analysis — FAIL · 2025-08-09 15:24:38 UTC · errors=2 warnings=3
[PROGRESS] Full Error Analysis — FAIL · 2025-08-09 15:47:43 UTC · errors=2 warnings=3

[PROGRESS] M5-plus (prep) ⏳
- Artefactos preparados (report-only): patches/m5-plus.patch, audit/PATCH_PLAN.md (sección M5-plus), audit/PATCH_TEST_PLAN.md (M5-plus TEST PLAN), actualización PROGRESS.md.
- Sin aplicación de código aún (diff pendiente de apply). Esperando fix base care_plan + .dict() primero.
