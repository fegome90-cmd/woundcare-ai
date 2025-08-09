#!/usr/bin/env zsh
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)

# Prefer backend/.venv, fallback to repo .venv
if [ -d "$ROOT/backend/.venv" ]; then
  source "$ROOT/backend/.venv/bin/activate"
elif [ -d "$ROOT/.venv" ]; then
  source "$ROOT/.venv/bin/activate"
fi

pip install -r "$ROOT/backend/requirements.txt"
cp -n "$ROOT/backend/.env.example" "$ROOT/backend/.env" || true

# Preserve any externally provided PORT before sourcing .env so it can override.
EXT_PORT="${PORT:-}"
# Export env vars from backend/.env if present (but don't clobber existing env for PORT)
if [ -f "$ROOT/backend/.env" ]; then
  # shellcheck disable=SC2046
  set -a
  source "$ROOT/backend/.env"
  set +a
fi
[ -n "$EXT_PORT" ] && PORT="$EXT_PORT"
PORT=${PORT:-8088}

# Allow disabling reload for stable verification runs: export RELOAD=0
RELOAD_FLAG="--reload"
if [ "${RELOAD:-1}" = "0" ]; then
  RELOAD_FLAG=""
fi

exec python -m uvicorn backend.service:app --host 127.0.0.1 --port "$PORT" $RELOAD_FLAG
