from __future__ import annotations
import json
import os
from uuid import uuid4
import time
from typing import Callable
from fastapi import Request
from datetime import datetime
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from dotenv import load_dotenv

from .schemas import RecommendRequest, PlanResult, Recommendation, Flags
from .pii import scan_pii
from .policy import validate_text_policy
from .engine import compute_risk, rank_dressings
from .plan import compose_care_plan
from .modsys.builtin import register_builtins
from .modsys.registry import get_registry
from .config import FEATURE_IA_COLUMN, DRY_RUN, APP_VERSION, CATALOG_SOURCE, READ_ONLY_CATALOG, USE_CATALOG_FOR_RANKING, TELEMETRY_LEVEL
from .catalog import repo as catalog_repo
from .policy import validate_text_policy, brand_gate
from .catalog.router import router as catalog_router
from .ia_column.pipeline import run_column

load_dotenv()

APP_MODE = os.getenv('APP_MODE', 'DEMO_STRICT')
AUDIT_PATH = os.getenv('AUDIT_PATH', './audit/audit_log.jsonl')

app = FastAPI(title="WoundCare AI Lite")
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

# Mount read-only catalog endpoints
app.include_router(catalog_router, prefix='/catalog', tags=['catalog'])

REQ_METRICS = {"count": 0, "ok": 0, "err": 0, "lat_ms": []}
WCA_COUNTERS = {"wca_requests_total": 0, "wca_errors_total": 0}
START_TIME = time.time()

def _percentile(arr, p):
    if not arr:
        return 0.0
    s = sorted(arr)
    k = (len(s) - 1) * (p / 100.0)
    f = int(k)
    c = min(f + 1, len(s) - 1)
    return s[f] if f == c else s[f] + (s[c] - s[f]) * (k - f)

@app.middleware("http")
async def timing(request: Request, call_next: Callable):
    t0 = time.perf_counter()
    ok = False
    try:
        resp = await call_next(request)
        ok = 200 <= getattr(resp, 'status_code', 0) < 400
        return resp
    finally:
        dt = (time.perf_counter() - t0) * 1000
        REQ_METRICS["count"] += 1
        WCA_COUNTERS["wca_requests_total"] += 1
        REQ_METRICS["ok" if ok else "err"] += 1
        if not ok:
            WCA_COUNTERS["wca_errors_total"] += 1
        arr = REQ_METRICS["lat_ms"]
        arr.append(dt)
        if len(arr) > 1000:
            del arr[: len(arr) - 1000]

@app.get('/metrics')
def metrics():
    arr = REQ_METRICS["lat_ms"]
    base = {
        "count": REQ_METRICS["count"],
        "ok": REQ_METRICS["ok"],
        "err": REQ_METRICS["err"],
        "p50_ms": round(_percentile(arr, 50), 1),
        "p95_ms": round(_percentile(arr, 95), 1),
    }
    # Add lite telemetry counters
    if TELEMETRY_LEVEL >= 1:
        base.update(WCA_COUNTERS)
    return base

@app.get('/status-lite')
def status_lite():
    """Lightweight status probe including uptime and last p95 snapshot."""
    arr = REQ_METRICS["lat_ms"]
    return {
        "status": "ok",
        "uptime_s": round(time.time() - START_TIME, 1),
        "p95_ms": round(_percentile(arr, 95), 1),
        "telemetry_level": TELEMETRY_LEVEL,
    }

@app.on_event("startup")
async def _startup() -> None:
    # Register built-in adapters. In the future we can load from env/config.
    register_builtins()


@app.get('/healthz')
async def healthz():
    reg = get_registry()
    return {
        'ok': True,
        'mode': APP_MODE,
        'version': APP_VERSION,
    'care_plan_enabled': True,  # top-level flag for verifier script
        'flags': {
            'feature_ia_column': FEATURE_IA_COLUMN,
            'dry_run': DRY_RUN,
            'catalog_source': CATALOG_SOURCE,
            'read_only_catalog': READ_ONLY_CATALOG,
            'care_plan_enabled': True,
        },
    'use_catalog_for_ranking': USE_CATALOG_FOR_RANKING,
        'mods': {
            'policy': list(reg.list('policy').keys()),
            'pii': list(reg.list('pii').keys()),
            'engine': list(reg.list('engine').keys()),
            'ranker': list(reg.list('ranker').keys()),
        },
        'catalog': {
            'source': CATALOG_SOURCE,
            'read_only': READ_ONLY_CATALOG,
        }
    }

@app.post('/recommend', response_model=PlanResult)
async def recommend(payload: RecommendRequest, response: Response):
    audit_id = uuid4()
    # Resolve modules from registry (defaults).
    reg = get_registry()
    pii_mod = reg.get('pii.default')()
    policy_mod = reg.get('policy.default')()
    engine_mod = reg.get('engine.default')()
    ranker_mod = reg.get('ranker.default')()

    pii_hits = pii_mod.scan(payload.eval.notes or '')
    policy_result = policy_mod.check(payload.eval.notes)
    blocked_content = bool(policy_result.get('blocked_content'))
    contains_only_generic = bool(policy_result.get('contains_only_generic'))

    risk = engine_mod.compute_risk(payload.eval)
    # Optional: build pool from catalog when enabled
    provenance = None
    pool = payload.available_dressings
    if USE_CATALOG_FOR_RANKING:
        try:
            source, items = catalog_repo.get_catalog()
            # If request provided a list, intersect by id
            req_ids = {d.id for d in payload.available_dressings} if payload.available_dressings else set()
            if req_ids:
                pool = [d for d in items if d.id in req_ids]
                if not pool:
                    pool = payload.available_dressings
            else:
                pool = items
            provenance = {
                'catalog_source': source or 'fallback',
                'pool_size': len(pool),
                'selected_ids': [d.id for d in pool],
            }
        except Exception:
            provenance = {'catalog_source': 'fallback', 'pool_size': len(pool), 'selected_ids': [d.id for d in pool]}
            pool = payload.available_dressings

    suggestions = ranker_mod.rank(payload.eval, pool)
    # Engine already populated reason_codes (localized) & why; keep unchanged here to avoid duplication.

    allowed = not pii_hits and not blocked_content

    plan_steps = []
    title = 'Plan de cuidado (genérico)'
    if allowed:
        if payload.eval.severity == 'high' or payload.eval.infection_signs:
            title = 'Plan prioritario (genérico)'
            plan_steps = [
                'Cobertura limpia inmediata no oclusiva',
                'Registro fotográfico inmediato',
                'Educación y signos de alarma',
                'Derivación prioritaria a evaluación clínica',
            ]
        else:
            plan_steps = [
                'Higiene y limpieza suave de la zona',
                'Registro fotográfico en cada control',
                'Educación al paciente/cuidador',
                'Control programado y reevaluación',
                'Derivar a evaluación clínica si empeora',
            ]
    else:
        plan_steps = ['Revisión manual requerida — demo estricta no muestra plan automático.']

    # Base recommendation (pre-IA column)
    recommendation = Recommendation(
        allowed=allowed,
        title=title,
        plan_steps=plan_steps,
        flags=Flags(blocked_content=blocked_content, contains_only_generic=contains_only_generic, pii=bool(pii_hits)),
        risk_score=risk,
        pii_hits=pii_hits,
        suggested_dressings=suggestions,
        disclaimer='Contenido demostrativo. No constituye indicación clínica ni prescripción.',
        provenance=provenance
    )

    # Compose care plan
    try:
        care_plan = compose_care_plan(payload.eval, [], [d.id for d in suggestions], pool, {'blocked_content': blocked_content})
    except Exception:
        care_plan = None

    # Sanitize any brand traces in title/steps as a safety net
    try:
        from .engine import GENERIC_CATEGORY_NAME  # reuse mapping if needed
        bg = brand_gate([recommendation.title] + recommendation.plan_steps)
        if bg.get('has_trademark') or bg.get('brand_hits'):
            recommendation.title = re.sub(r"[\u2122\u00AE]", "", recommendation.title)
            recommendation.plan_steps = [re.sub(r"[\u2122\u00AE]", "", s) for s in recommendation.plan_steps]
    except Exception:
        pass

    # Optional IA column (in-proc, DRY_RUN by default). Do not alter base unless we later allow.
    if FEATURE_IA_COLUMN:
        try:
            # M5 fix base: use .dict() for Pydantic v1 compatibility
            col_out = run_column(payload.dict(), base_rec=recommendation.dict())
            # For now, we only attach a synthetic note into disclaimer to show it's wired, but keep plan unchanged.
            if DRY_RUN:
                recommendation.disclaimer += " | IA column (dry-run) quality=" + str(round(col_out.get('quality', 0.0), 2))
                try:
                    response.headers['X-WCA-IA-Quality'] = str(round(col_out.get('quality', 0.0), 3))
                except Exception:
                    pass
            else:
                # If ever allowed to modify, we could replace title/steps when safe. Keep fail-closed.
                pass
        except Exception:
            # Fail closed: ignore IA column on errors
            pass

    # M5 fix base: .dict() for Pydantic v1 compatibility
    req_dump = payload.dict()
    # Ensure UUIDs are strings in audit log
    if isinstance(req_dump.get('scope', {}).get('session_id'), (str,)) is False:
        req_dump['scope']['session_id'] = str(req_dump['scope']['session_id'])
    # Dual exposure: embed care_plan also inside recommendation object
    try:
        recommendation.care_plan = care_plan
    except Exception:
        pass
    record = {
        'audit_id': str(audit_id),
        'ts': datetime.utcnow().isoformat() + 'Z',
        'mode': APP_MODE,
        'request': req_dump,
        'result': recommendation.dict(),  # Pydantic v1 compat
    }
    os.makedirs(os.path.dirname(AUDIT_PATH), exist_ok=True)
    with open(AUDIT_PATH, 'a', encoding='utf-8') as f:
        f.write(json.dumps(record, ensure_ascii=False) + '\n')

    result = PlanResult(recommendation=recommendation, audit_id=audit_id, care_plan=care_plan)
    return result
