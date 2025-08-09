#!/usr/bin/env bash
# Append a structured issue entry into docs/KNOWN_ISSUES.md (Autodisciplina)
set -euo pipefail
FILE=docs/KNOWN_ISSUES.md
TITLE=${1:-}
REPRO=${2:-}
IMPACT=${3:-}
ACTION=${4:-}
[ -z "$TITLE" ] && echo "Uso: log_issue.sh 'Título' 'Reproducción' 'Impacto' 'Acción propuesta'" >&2 && exit 1
TS=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
{
  echo "\n## $TS — $TITLE"
  [ -n "$REPRO" ] && echo "- Reproducción: $REPRO" || true
  [ -n "$IMPACT" ] && echo "- Impacto: $IMPACT" || true
  [ -n "$ACTION" ] && echo "- Acción propuesta: $ACTION" || true
} >> "$FILE"
echo "Registrado en $FILE"
