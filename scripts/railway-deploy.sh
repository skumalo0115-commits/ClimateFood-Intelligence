#!/usr/bin/env bash
set -euo pipefail

if ! command -v railway >/dev/null 2>&1; then
  echo "Railway CLI is not installed. Install it first: npm i -g @railway/cli"
  exit 1
fi

if [[ -z "${RAILWAY_TOKEN:-}" ]]; then
  echo "RAILWAY_TOKEN is not set. Create one from Railway Account Settings and export it before running this script."
  exit 1
fi

BACKEND_SERVICE_NAME="${BACKEND_SERVICE_NAME:-backend}"
FRONTEND_SERVICE_NAME="${FRONTEND_SERVICE_NAME:-frontend}"
BACKEND_PUBLIC_DOMAIN="${BACKEND_PUBLIC_DOMAIN:-}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

pushd "$REPO_ROOT/backend" >/dev/null
echo "Deploying backend service: $BACKEND_SERVICE_NAME"
railway up --service "$BACKEND_SERVICE_NAME" --ci
popd >/dev/null

if [[ -z "$BACKEND_PUBLIC_DOMAIN" ]]; then
  echo "BACKEND_PUBLIC_DOMAIN is not set."
  echo "Set it to your backend Railway URL before deploying frontend."
  echo "Example: export BACKEND_PUBLIC_DOMAIN=https://climatefood-backend.up.railway.app"
  exit 1
fi

pushd "$REPO_ROOT/frontend" >/dev/null
echo "Deploying frontend service: $FRONTEND_SERVICE_NAME"
railway variables --set "NEXT_PUBLIC_BACKEND_URL=$BACKEND_PUBLIC_DOMAIN" --service "$FRONTEND_SERVICE_NAME"
railway up --service "$FRONTEND_SERVICE_NAME" --ci
popd >/dev/null

echo "Deployments submitted successfully."
