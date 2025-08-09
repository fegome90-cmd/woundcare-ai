#!/usr/bin/env bash
set -euo pipefail
PORT=${PORT:-8088}
# Prefer provided PYTHON, else python3
PY=${PYTHON:-python3}
exec "$PY" -m uvicorn backend.service:app --host 0.0.0.0 --port ${PORT}
