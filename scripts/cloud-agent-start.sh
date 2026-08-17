#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  npm ci
fi

if curl -sf "http://127.0.0.1:5173/" >/dev/null 2>&1; then
  exit 0
fi

nohup npm run dev > /tmp/itnry-vite.log 2>&1 &

for _ in $(seq 1 40); do
  if curl -sf "http://127.0.0.1:5173/" >/dev/null 2>&1; then
    exit 0
  fi
  sleep 0.5
done

echo "Itnry Vite server failed to become ready on :5173" >&2
tail -n 40 /tmp/itnry-vite.log >&2 || true
exit 1
