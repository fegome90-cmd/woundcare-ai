#!/usr/bin/env bash
set -euo pipefail
HOST=${WCA_HOST:-http://127.0.0.1:8088}
BUDGET=${WCA_BUDGET_MS:-800}
N=${WCA_LOAD_N:-30}
PY_BIN=${PYTHON_BIN:-python3}

curl -fsS "$HOST/healthz" >/dev/null || { echo 'healthz fail'; exit 1; }
SL=$(curl -fsS "$HOST/status-lite") || { echo 'status-lite fail'; exit 1; }
# Basic shape checks
python - <<'PY'
import os,sys,json,urllib.request,time,statistics,uuid
HOST=os.environ.get('WCA_HOST','http://127.0.0.1:8088')
N=int(os.environ.get('WCA_LOAD_N','30'))
BUDGET=int(os.environ.get('WCA_BUDGET_MS','800'))

payload={
  "scope":{"patient_id":"PAT-M65","session_id":"","requester":"demo"},
  "eval":{"wound_type":"ulcer","severity":"moderate","exudate_level":"moderate","infection_signs":False,"pain_level":"mild","necrosis":False,"notes":"ok"},
  "available_dressings":[{"id":"gauze","name":"Gasa","category":"gauze","absorbency":"high","occlusive":False,"adhesive":False}]
}

import urllib.request as r

def post(path,data):
    req=r.Request(HOST+path,data=json.dumps(data).encode(),headers={'Content-Type':'application/json'})
    with r.urlopen(req,timeout=5) as resp: return json.loads(resp.read())

def get(path):
    with r.urlopen(HOST+path,timeout=5) as resp: return json.loads(resp.read())

sl=get('/status-lite')
assert sl.get('status')=='ok','status-lite status!=ok'
assert 'uptime_s' in sl and 'p95_ms' in sl,'missing fields in status-lite'

lat=[]
for i in range(N):
    payload['scope']['session_id']=str(uuid.uuid4())
    t0=time.perf_counter(); post('/recommend',payload); dt=(time.perf_counter()-t0)*1000; lat.append(dt)

p50=statistics.median(lat); p95=sorted(lat)[int(max(0, round(0.95*(len(lat)-1))))]
mm=get('/metrics')
for k in ['wca_requests_total','wca_errors_total']: assert k in mm, f'metric {k} missing'
assert p95<=BUDGET, f'p95 client {p95:.1f} > {BUDGET}'
print(json.dumps({"count":N,"client_ms":{"p50":round(p50,1),"p95":round(p95,1)},"server_p95":mm.get('p95_ms'),"status_lite":sl},ensure_ascii=False))
PY
