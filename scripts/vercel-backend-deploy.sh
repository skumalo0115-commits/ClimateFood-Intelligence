#!/usr/bin/env bash
set -euo pipefail

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is not installed. Install it first: npm i -g vercel"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

pushd "$REPO_ROOT/backend" >/dev/null
echo "Deploying backend from the backend directory with Vercel."
echo "Make sure the backend environment variables are already set in your Vercel backend project settings."

if [[ "${1:-}" == "--prod" ]]; then
  vercel --prod
else
  vercel
fi

popd >/dev/null
