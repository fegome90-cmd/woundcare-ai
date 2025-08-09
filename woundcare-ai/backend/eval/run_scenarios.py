#!/usr/bin/env python3
"""
Run evaluation scenarios against the local FastAPI backend (/recommend) and print a compact report.
Prereqs: backend running on :8088.
"""
import json
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List

import http.client

BASE_HOST = "localhost"
BASE_PORT = 8088

ROOT = Path(__file__).resolve().parent
SCENARIOS = ROOT / "scenarios.json"

from dressings_sample import SAMPLE_DRESSINGS  # noqa


def post(path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    conn = http.client.HTTPConnection(BASE_HOST, BASE_PORT, timeout=10)
    body = json.dumps(payload)
    headers = {"Content-Type": "application/json"}
    conn.request("POST", path, body, headers)
    resp = conn.getresponse()
    data = resp.read()
    try:
        return {"status": resp.status, "json": json.loads(data or b"null")}
    except Exception:
        return {"status": resp.status, "raw": data.decode("utf-8", "ignore")}
    finally:
        conn.close()


def run_scenarios():
    spec = json.loads(SCENARIOS.read_text())
    results: List[Dict[str, Any]] = []
    latencies: List[float] = []
    for sc in spec["scenarios"]:
        scope = sc.get("scope", {})
        eval_ = sc.get("eval", {})
        payload = {
            "scope": {
                "patient_id": f"demo-{uuid.uuid4().hex[:8]}",
                "session_id": str(uuid.uuid4()),
                "requester": "demo",
                **{k: v for k, v in scope.items() if k not in ("site", "locale")},
            },
            "eval": eval_,
            "available_dressings": SAMPLE_DRESSINGS,
        }
        t0 = time.time()
        res = post("/recommend", payload)
        dt = (time.time() - t0) * 1000
        latencies.append(dt)
        row = {"id": sc["id"], "type": sc["type"], "ms": round(dt, 1), "status": res.get("status")}
        body = res.get("json") or {}
        rec = (body or {}).get("recommendation", {})
        flags = rec.get("flags", {})
        allowed = rec.get("allowed")
        row.update({
            "allowed": allowed,
            "blocked": flags.get("blocked_content"),
            "pii": flags.get("pii"),
        })
        results.append(row)
    # summary
    p50 = sorted(latencies)[len(latencies)//2] if latencies else 0
    p95 = sorted(latencies)[int(len(latencies)*0.95)-1] if latencies else 0
    print("id\ttype\tms\tstatus\tallowed\tblocked\tpii")
    for r in results:
        print("{id}\t{type}\t{ms}\t{status}\t{allowed}\t{blocked}\t{pii}".format(**r))
    print(f"\nlatency p50={p50:.1f}ms p95={p95:.1f}ms (n={len(latencies)})")


if __name__ == "__main__":
    run_scenarios()
