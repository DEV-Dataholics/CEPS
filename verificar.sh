#!/usr/bin/env bash
# Compuerta de Calidad Integral · CEPS
# Todo debe pasar para permitir commits o avances de sprint.
set -uo pipefail

RAIZ="$(cd "$(dirname "$0")" && pwd)"
WEB="$RAIZ/apps/web"
API="$RAIZ/apps/api"
FALLAS=0

paso() {
  local nombre="$1"; shift
  echo ""
  echo "══════════════════════════════════════════════════"
  echo "▶ $nombre"
  echo "══════════════════════════════════════════════════"
  if "$@"; then
    echo "✔ $nombre"
  else
    echo "✘ $nombre FALLÓ"
    FALLAS=$((FALLAS + 1))
  fi
}

# 1. Frontend (apps/web)
paso "Frontend: Typecheck (tsc --noEmit)" bash -c "cd '$WEB' && npm run typecheck"
paso "Frontend: Lint"                     bash -c "cd '$WEB' && npm run lint"

# 2. Backend (apps/api)
paso "Backend: Rutas CodeIgniter 4"      bash -c "cd '$API' && php spark routes"

echo ""
echo "══════════════════════════════════════════════════"
if [ "$FALLAS" -eq 0 ]; then
  echo "✔ COMPUERTA EN VERDE — todos los pasos pasaron"
  exit 0
fi
echo "✘ COMPUERTA ROJA — $FALLAS paso(s) fallaron"
exit 1
