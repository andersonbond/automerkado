#!/usr/bin/env bash
#
# From your Mac (sanity Next build here + rsync + remote Linux build):
#   ./deploy.sh
#
# On the VPS alone (SKIP the Mac-era “build locally” step — avoids OOM on 2 GB RAM):
#   ./deploy.sh --server
#
# Note: `./deploy.sh` on the VPS without --server starts with `npm run build` → SIGKILL/OOM on small VPS.
#
set -euo pipefail

REMOTE="appuser@188.166.236.178"
DEST="/home/appuser/automerkado"

# One body: keep Mac `ssh bash -s` path and `./deploy.sh --server` identical.
REMOTE_DEPLOY_BODY=$(cat <<'EOS'
set -euo pipefail
cd "$1" || exit 1
export NPM_CONFIG_AUDIT=false
export NPM_CONFIG_FUND=false
npm install
npx prisma migrate deploy
pm2 stop automerkado 2>/dev/null || true
rm -rf .next
# Cap heap per process; webpack workers inherit (see Next build worker RSS on small RAM).
export NODE_OPTIONS='--max-old-space-size=1024'
npm run build:deploy
npm run backfill:listing-thumbnails
pm2 restart automerkado
EOS
)

run_remote_deploy() {
  printf '%s' "$REMOTE_DEPLOY_BODY" | bash -s -- "$1"
}

if [[ "${1:-}" == "--server" || "${1:-}" == "--on-server" ]]; then
  repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  echo "→ Server-only (${repo}) — skipping Mac build / rsync"
  run_remote_deploy "$repo"
  echo "✓ Deployed (server-only)"
  exit 0
fi

echo "→ Building locally (Mac sanity check)"
npm run build

echo "→ Syncing to $REMOTE:$DEST"
rsync -avz --delete \
  --exclude='.git' \
  --exclude='.env*' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='prisma/*.db*' \
  --exclude='public/uploads' \
  --exclude='.DS_Store' \
  --exclude='terminals' \
  ./ "$REMOTE:$DEST/"

# OOM (“Killed” / SIGKILL): enable ≥2 GB swap, then `sudo swapon`, check `free -h`.

echo "→ Remote: deps + migrate + build on Linux + backfill + PM2"
printf '%s' "$REMOTE_DEPLOY_BODY" | ssh "$REMOTE" bash -s -- "$DEST"

echo "✓ Deployed"
