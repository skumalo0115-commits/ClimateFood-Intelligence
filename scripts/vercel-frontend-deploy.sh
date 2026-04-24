#!/usr/bin/env bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is not installed. Install it first: npm i -g vercel"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

pushd "$REPO_ROOT/frontend" >/dev/null
echo "Deploying frontend from the frontend directory with Vercel."
echo "Make sure NEXT_PUBLIC_BACKEND_URL is already set in your Vercel project settings and points to your Vercel backend project."

if [[ "${1:-}" == "--prod" ]]; then
  vercel --prod
else
  vercel
fi

popd >/dev/null
