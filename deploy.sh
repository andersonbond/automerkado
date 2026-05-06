#!/usr/bin/env bash
set -euo pipefail

REMOTE="appuser@188.166.236.178"
DEST="/home/appuser/automerkado"

echo "→ Building locally"
npm run build

echo "→ Syncing to $REMOTE:$DEST"
rsync -avz --delete \
  --exclude='.git' \
  --exclude='.env*' \
  --exclude='node_modules' \
  --exclude='.next/cache' \
  --exclude='prisma/*.db*' \
  --exclude='public/uploads' \
  --exclude='.DS_Store' \
  --exclude='terminals' \
  ./ "$REMOTE:$DEST/"

echo "→ Installing deps + migrating + restarting"
ssh "$REMOTE" "
  cd $DEST &&
  npm ci &&
  npx prisma migrate deploy &&
  pm2 restart automerkado
"

echo "✓ Deployed"