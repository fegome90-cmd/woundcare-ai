# KNOWN ISSUES / BACKLOG (Autodisciplina)

> Registrar fallos reproducidos para corrección posterior sin bloquear hitos ya cerrados.

## 2025-08-09 – Probes & Monitor / Gate Scripts

1. close_m5.sh sin backend levantado
   - Reproducción: detener uvicorn y ejecutar `bash scripts/close_m5.sh`.
   - Resultado: Falla inmediata (`healthz FAIL`). Salida esperada (protección) pero oportunidad: mensaje más claro / sugerir tarea Start Backend.
   - Acción futura: Mejorar UX (detectar puerto configurable, sugerir comando). No urgente.

2. verify_m65.sh con TELEMETRY_LEVEL=0
   - Reproducción: `TELEMETRY_LEVEL=0 ./scripts/dev_backend.sh` y luego `bash scripts/verify_m65.sh`.
   - Resultado: AssertionError por ausencia de métricas `wca_requests_total`.
   - Interpretación: Diseño actual asume nivel >=1. Necesario fallback: si TELEMETRY_LEVEL=0, el verificador debería avisar y fallar con mensaje instructivo o degradar test de métricas.
   - Acción futura: Añadir chequeo explícito y mensaje: "TELEMETRY_LEVEL=0 deshabilita métricas wca_*. Ejecuta con TELEMETRY_LEVEL=1".

## Próximos pasos sugeridos (no ejecutados todavía)
- Añadir flags `--allow-no-telemetry` en verify_m65.sh (opcional) para ambientes muy restringidos.
- close_m5.sh: detectar puerto activo leyendo /healthz de lista {8888,8088} antes de abortar.

(Registrar nuevas incidencias aquí con fecha, steps, impacto, acción propuesta.)
