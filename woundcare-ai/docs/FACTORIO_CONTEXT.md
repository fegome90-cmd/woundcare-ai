# Contexto Factorio aplicado a WoundCare AI

Este resumen toma ideas clave del artículo “Develop AI Agents for System Engineering in Factorio” y las aterriza en nuestra arquitectura WoundCare AI (demo Lite) para guiar diseño, métricas y evaluación segura.

## Ideas clave (síntesis práctica)
- Ley de la Variedad Requisita (LRV): el sistema debe tener suficiente “variedad interna” para manejar la variedad del entorno; adaptarse primero y luego simplificar.
- Modelo de Sistema Viable (VSM): 5 niveles jerárquicos que balancean operación presente vs. planificación futura.
- Evaluaciones dinámicas y abiertas: medir en escenarios cambiantes, no sólo pruebas estáticas.
- Agente–Evaluador: un orquestador introduce objetivos/perturbaciones; el agente mantiene estabilidad y objetivos.
- Automatización modular: diseño por componentes intercambiables; soporte para “modding”/extensión.

## Mapeo VSM → WoundCare AI
- Sistema 1 (Operación):
  - Ingesta de datos clínicos (formulario/UI), validaciones, motor de reglas determinista (backend/engine.py), render de plan.
- Sistema 2 (Coordinación):
  - Orquestación frontend (public/js/wca-lite.js), sincronización de estado/UI, manejo de errores y CORS.
- Sistema 3 (Optimización presente):
  - Telemetría básica (latencias de /recommend), auditoría JSONL (backend/service.py), límites y políticas (policy.py).
- Sistema 4 (Planificación futura):
  - Catálogo de productos actualizable, escenarios de evaluación (docs + backend/eval/scenarios.json), análisis de “gaps” de variedad.
- Sistema 5 (Política/Propósito):
  - Guardrails: PII (pii.py), bloqueo de contenido, DEMO_STRICT fail-closed, cumplimiento/formulario.

## LRV en la práctica (variedad del entorno vs. del sistema)
- Variedad externa (VE) típica: múltiples combinaciones de TIMERSOP, cambios de formulación/stock, políticas clínicas, calidad de imágenes, latencia de red.
- Variedad interna (VR) actual: reglas deterministas, catálogo de apósitos/tags, fallback a contenido genérico, auditoría y validación estricta.
- Palancas para aumentar VR sin perder seguridad:
  - Ampliar catálogo etiquetado (dressings + contraindicaciones).
  - Reglas parametrizadas por política/localidad (feature flags por site).
  - Rutas de degradación explícitas: de recomendación específica → familia de producto → consejo genérico + “consulta especialista”.

## Métricas (análogas a SPM de Factorio)
- Seguridad primero:
  - Incidentes de seguridad por 1k planes (ideal 0; audit flag-rate, PII-detect-rate).
  - Porcentaje de “fail-closed” justificados vs. falsos positivos.
- Desempeño/flujo:
  - p50/p95 latencia /recommend; throughput recom/min en demo local.
  - Coverage: % combinaciones TIMERSOP de una batería de escenarios cubiertas con recomendación “elegible”.
- Robustez/adaptabilidad:
  - Degradación controlada bajo perturbaciones (ver escenarios) con objetivo de mantener plan viable o fallback seguro.

## Agente–Evaluador (propuesta)
- Evaluador (humano o script) ejecuta escenarios perturbados y puntúa:
  - Cambios abruptos: aumentar exudado, infección presente, dolor 5/5.
  - Restricciones: contraindicación añadida, producto no disponible.
  - Entorno: peticiones en ráfaga, campos faltantes/ruidosos.
- Salidas del evaluador: score de seguridad (hard fail si viola guardrail), score de cobertura, score de latencia, nota de degradación/fallback.

## Escenarios de evaluación (stub)
- Archivo: backend/eval/scenarios.json (ver en repo). Tipos:
  - happy_path: casos comunes cubiertos por reglas.
  - edge_safety: PII en inputs, contenido bloqueado.
  - resource_shift: contraindicación/stock no disponible → alternativa.
  - stress_latency: ráfaga de solicitudes → latencias p95 aceptables.

## Backlog mínimo guiado por este contexto
- Añadir runner local de escenarios que consuma /recommend y genere un reporte CSV/JSON (no bloqueante para demo).
- Ampliar catálogo de dressings con metadata clínica y tags consistentes.
- Exponer métricas simples (contadores/latencias) a un endpoint /metrics (texto/JSON) o a los logs.
- Documentar políticas locales (flags) y cómo impactan la elegibilidad en el motor.

## Notas de seguridad
- Mantener DEMO_STRICT activado; ante duda, fallar-cerrado con contenido genérico, sin claims terapéuticos.
- Auditar todo request/response con hash de entrada, timestamp y flags.

---
Este documento es complementario a INTEGRATION_BRIEF.md y sirve como brújula de diseño y evaluación inspirada en Factorio.
