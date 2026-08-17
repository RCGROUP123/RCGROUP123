#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  npm ci
fi

if ! curl -sf "http://127.0.0.1:${PREVIEW_PORT:-3000}/" >/dev/null 2>&1; then
  nohup npm run preview > /tmp/readme-preview.log 2>&1 &
  for _ in $(seq 1 30); do
    if curl -sf "http://127.0.0.1:${PREVIEW_PORT:-3000}/" >/dev/null 2>&1; then
      exit 0
    fi
    sleep 1
  done
  echo "README preview server failed to become ready" >&2
  exit 1
fi
