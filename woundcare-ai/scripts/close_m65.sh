#!/usr/bin/env bash
set -euo pipefail
HOST=${WCA_HOST:-http://127.0.0.1:8088}
PY_BIN=${PYTHON_BIN:-python3}
JSON=$(WCA_HOST="$HOST" bash scripts/verify_m65.sh)
P50=$(echo "$JSON" | $PY_BIN -c 'import sys,json;print(json.load(sys.stdin)["client_ms"]["p50"])')
P95=$(echo "$JSON" | $PY_BIN -c 'import sys,json;print(json.load(sys.stdin)["client_ms"]["p95"])')
COUNT=$(echo "$JSON" | $PY_BIN -c 'import sys,json;print(json.load(sys.stdin)["count"])')
TS=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
LINE="[PROGRESS] M6.5 – Probes & Monitor (lite) ✅ · $TS · n=$COUNT · client p50=${P50}ms p95=${P95}ms · beacon OK"
echo "$LINE" >> docs/PROGRESS.md
echo "Registrado: $LINE"
