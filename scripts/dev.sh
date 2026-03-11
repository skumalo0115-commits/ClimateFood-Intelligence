#!/usr/bin/env bash
set -euo pipefail

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

(
  cd "$REPO_ROOT/backend"
  if [[ ! -d .venv ]]; then
    python3 -m venv .venv
  fi
  # shellcheck disable=SC1091
  source .venv/bin/activate
  if [[ ! -f .env ]]; then
    cp .env.example .env
  fi
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port "$BACKEND_PORT"
) &

(
  cd "$REPO_ROOT/frontend"
  if [[ ! -f .env.local ]]; then
    cp .env.example .env.local
  fi
  npm install
  npm run dev -- --port "$FRONTEND_PORT"
)
