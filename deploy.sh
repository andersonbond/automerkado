#!/usr/bin/env bash
set -euo pipefail

REMOTE="appuser@188.166.236.178"
DEST="/home/appuser/automerkado"

echo "→ Building locally"
npm run build

echo "→ Syncing to $REMOTE:$DEST"
# Never rsync `.next` from macOS to Linux — `node_modules` is Linux-specific and the
# build output must match the host or `next start` often crashes (PM2 shows restarts / site 502).
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

# If ssh reports "Killed" during installs, Linux OOM-killed npm — common without swap on a 1–2GB VPS.
# Add ~2GB swap once on the droplet (then re-run deploy):
#   sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile

echo "→ Installing deps + building on Linux + migrating + backfilling + restarting"
# `npm ci` wipes node_modules every time and spikes RAM; `npm install` is incremental and usually survives small hosts.
# Build must run on the VPS (see `.next` rsync exclude). Ensure swap (~2G) on 2GB RAM or this step may be OOM-killed.
ssh "$REMOTE" "
  set -euo pipefail
  cd $DEST &&
  export NPM_CONFIG_AUDIT=false &&
  export NPM_CONFIG_FUND=false &&
  npm install &&
  npx prisma migrate deploy &&
  rm -rf .next &&
  export NODE_OPTIONS='--max-old-space-size=1536' &&
  npm run build &&
  npm run backfill:listing-thumbnails &&
  pm2 restart automerkado
"

echo "✓ Deployed"