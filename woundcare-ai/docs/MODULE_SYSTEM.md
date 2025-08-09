# Módulo de gestión de módulos (Module System)

Este documento describe el micro-sistema de módulos incorporado para facilitar el escalado y la extensibilidad, tanto en backend como en frontend.

## Objetivo
Proveer un punto único para registrar, descubrir y reemplazar componentes (política, PII, motor de riesgo, ranking, renderers UI, etc.) sin tocar el cableado principal de la app.

## Backend
- Paquete: `backend/modsys`
- Piezas clave:
  - `registry.py`: Registro singleton con metadatos (`ModInfo`).
  - `contracts.py`: Interfaces (ABCs) para `PolicyModule`, `PIIModule`, `EngineModule`, `RankerModule`, `PlannerModule`.
  - `adapters.py`: Adaptadores a la implementación actual (policy, pii, engine, ranker) para facilitar el swap futuro.
  - `builtin.py`: Registro de módulos por defecto. Se ejecuta en el evento `startup` del servicio.
- Integración en `backend/service.py`:
  - `register_builtins()` en startup.
  - Resolución de módulos (`pii.default`, `policy.default`, `engine.default`, `ranker.default`) en `/recommend`.

### Cómo agregar un módulo nuevo
1. Implemente el contrato correspondiente en un archivo nuevo (p. ej., `my_ranker.py`).
2. Registre el módulo en `builtin.py` o en un archivo de inicialización propio, usando `get_registry().register('ranker.mi_ranker', lambda: MiRanker(), ModInfo(...))`.
3. En `service.py`, cambie la clave a cargar desde config/ENV si desea seleccionarlo dinámicamente.

## Frontend
- Carpeta: `public/js/modsys`
- Piezas clave:
  - `registry.js`: Registro simple (Map) con metadatos.
  - `contracts.js`: Contratos para `RecommenderRenderer`, `TipsModule`, `DemoFiller`.
  - `builtin.js`: Implementaciones por defecto y función `registerBuiltins()`.
- Integración en `public/index.html`:
  - Carga de `registerBuiltins()` para registrar módulos UI por defecto.
  - Exposición de `window.WCA_MODS.list()` para inspección/debug.

### Cómo usar desde la UI
- Obtener e instanciar: `const Renderer = get('render.rec.default'); const view = Renderer().render(rec);`.
- Listar disponibles: `WCA_MODS.list('render')`.

## Beneficios clave
- Bajo acoplamiento: cambiar una pieza (p. ej., motor) no exige tocar el endpoint o UI.
- Enchufable: fácil probar alternativas (heurísticas vs. ML) lado a lado.
- Seguridad/guardrails composables: se puede encadenar validadores/políticas.
- Observabilidad: el endpoint `/healthz` ahora expone módulos cargados.
- Escalado gradual: empezar simple, crecer con módulos especializados por sitio o mercado.

## Siguientes pasos sugeridos
- Selección por ambiente (variables ENV) para elegir claves del registro por tipo (`ENGINE_IMPL=engine.ml.v1`).
- Composición (pipelines) dentro del registro para ejecutar múltiples módulos del mismo tipo.
- Tests unitarios dedicados a cada contrato.
