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
# Parallel npm lifecycle scripts spike RSS on small VPS; serialize installs.
export NPM_CONFIG_JOBS=1
echo "→ Memory (RAM/swap); SIGKILL often means OOM — add swap if Swap: 0B:"
free -h || true
# Cap Node heap during install + Prisma postinstall (multiple processes × heap cap ≈ total RSS).
NODE_OPTIONS='--max-old-space-size=768' npm install
npx prisma migrate deploy
pm2 stop automerkado 2>/dev/null || true
rm -rf .next
export NEXT_TELEMETRY_DISABLED=1
# Single webpack process (experimental.webpackBuildWorker: false): one Node heap spike — cap 1024 MiB.
export NODE_OPTIONS='--max-old-space-size=1024'
npm run build:vps
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

# OOM (“Killed” / SIGKILL): add swap on the VPS if needed, e.g.:
#   sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
#   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
# If builds still die after webpackBuildWorker:false, grow swap (e.g. second 2G file) or build on a larger runner.
echo "→ Remote: deps + migrate + build on Linux + backfill + PM2"
printf '%s' "$REMOTE_DEPLOY_BODY" | ssh "$REMOTE" bash -s -- "$DEST"

echo "✓ Deployed"
