#!/usr/bin/env bash
# Production Next build for linux/amd64 (matches the VPS). Run on your Mac before ./deploy.sh --prebuilt
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Desktop, then re-run." >&2
  exit 1
fi

echo "→ Building in Docker (linux/amd64) — output: .next/"
docker run --rm --platform linux/amd64 \
  -v "$(pwd)":/app -w /app \
  -v "${HOME}/.npm:/root/.npm" \
  -e SKIP_TYPECHECK=1 \
  -e VPS_BUILD=1 \
  -e NEXT_TELEMETRY_DISABLED=1 \
  -e NPM_CONFIG_AUDIT=false \
  -e NPM_CONFIG_FUND=false \
  -e NPM_CONFIG_FETCH_RETRIES=5 \
  -e NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
  -e NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
  node:20-bookworm-slim \
  bash -c '
    set -euo pipefail
    apt-get update -qq
    apt-get install -y -qq openssl ca-certificates >/dev/null
    npm config set fetch-retries 5
    npm config set fetch-retry-mintimeout 20000
    npm config set fetch-retry-maxtimeout 120000
    attempt=1
    until npm ci; do
      if [[ "$attempt" -ge 3 ]]; then
        echo "npm ci failed after 3 attempts (often ECONNRESET — retry or check Wi‑Fi/VPN)." >&2
        exit 1
      fi
      echo "→ npm ci failed (attempt $attempt/3), retrying in 15s..."
      sleep 15
      attempt=$((attempt + 1))
    done
    npm run build:vps
  '

if [[ ! -f .next/BUILD_ID ]]; then
  echo "Build failed: .next/BUILD_ID missing" >&2
  exit 1
fi
echo "✓ Linux build ready — run: ./deploy.sh --prebuilt"
