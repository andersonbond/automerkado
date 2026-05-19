#!/usr/bin/env bash
#
# Recommended (Mac): Linux build in Docker, rsync .next, no `next build` on VPS (avoids OOM):
#   npm run typecheck && ./deploy.sh --prebuilt
#
# Mac + remote build on VPS (often OOM on 1 vCPU even with 4 GB RAM):
#   ./deploy.sh
#
# VPS only:
#   ./deploy.sh --server          # as appuser, not root
#   ./deploy.sh --server --no-build   # after ./deploy.sh --prebuilt rsynced .next
#
set -euo pipefail

REMOTE="appuser@188.166.236.178"
DEST="/home/appuser/automerkado"

# One body: keep Mac `ssh bash -s` path and `./deploy.sh --server` identical.
REMOTE_DEPLOY_BODY=$(cat <<'EOS'
set -euo pipefail
cd "$1" || exit 1

_deploy_pm2() {
  local app_user="${AUTOMERKADO_APP_USER:-$(stat -c '%U' . 2>/dev/null || id -un)}"
  if [[ "$(id -un)" == "$app_user" ]]; then
    pm2 "$@"
  else
    sudo -u "$app_user" pm2 "$@"
  fi
}

_deploy_stop_runtime() {
  echo "→ Stopping PM2 automerkado (frees next-server RAM for build)"
  _deploy_pm2 stop automerkado 2>/dev/null || true
  sleep 2
  if pgrep -af 'next-server' >/dev/null 2>&1; then
    echo "! next-server still running — pm2 stop all as $(stat -c '%U' . 2>/dev/null || id -un)"
    _deploy_pm2 stop all 2>/dev/null || true
    sleep 2
  fi
  if pgrep -af 'next-server' >/dev/null 2>&1; then
    echo "! Warning: next-server still present; build may OOM. Run deploy as appuser, not root."
    pgrep -af 'next-server' || true
  fi
}

_deploy_clean_dot_next() {
  [[ ! -e .next ]] && return 0
  if rm -rf .next 2>/dev/null; then
    return 0
  fi
  echo "→ Removing .next with sudo (left over from an earlier root deploy)"
  sudo rm -rf .next
}

_automerkado_deploy_cleanup() {
  if [[ "${AUTOMERKADO_FASTAPI_STOPPED:-}" == "1" ]]; then
    echo "→ Restarting fastapi.service (acbmarket)"
    sudo systemctl start fastapi.service 2>/dev/null || true
    AUTOMERKADO_FASTAPI_STOPPED=
  fi
  if [[ "${AUTOMERKADO_POSTGRES_STOPPED:-}" == "1" ]]; then
    echo "→ Restarting postgresql"
    sudo systemctl start postgresql 2>/dev/null || true
    AUTOMERKADO_POSTGRES_STOPPED=
  fi
}
trap _automerkado_deploy_cleanup EXIT

export NPM_CONFIG_AUDIT=false
export NPM_CONFIG_FUND=false
# Parallel npm lifecycle scripts spike RSS on small VPS; serialize installs.
export NPM_CONFIG_JOBS=1
echo "→ Memory (RAM/swap); SIGKILL often means OOM — add swap if Swap: 0B:"
free -h || true
if [[ "${AUTOMERKADO_DEPLOY_FREE_RAM:-}" == "1" ]]; then
  if sudo -n true 2>/dev/null; then
    if systemctl is-active --quiet fastapi.service 2>/dev/null; then
      echo "→ AUTOMERKADO_DEPLOY_FREE_RAM=1: stopping fastapi.service (acbmarket) for build"
      sudo systemctl stop fastapi.service && AUTOMERKADO_FASTAPI_STOPPED=1
    fi
    if systemctl is-active --quiet postgresql 2>/dev/null; then
      echo "→ AUTOMERKADO_DEPLOY_FREE_RAM=1: stopping postgresql for build"
      sudo systemctl stop postgresql && AUTOMERKADO_POSTGRES_STOPPED=1
    fi
  else
    echo "! AUTOMERKADO_DEPLOY_FREE_RAM=1 but sudo -n failed — stop fastapi/postgres manually, then re-run."
    echo "  sudo systemctl stop fastapi.service postgresql"
  fi
fi
_deploy_stop_runtime
# Cap Node heap during install + Prisma postinstall (multiple processes × heap cap ≈ total RSS).
NODE_OPTIONS='--max-old-space-size=768' npm install
npx prisma migrate deploy
_deploy_clean_dot_next
export NEXT_TELEMETRY_DISABLED=1
if [[ "${AUTOMERKADO_SKIP_REMOTE_BUILD:-}" == "1" ]]; then
  if [[ ! -f .next/BUILD_ID ]]; then
    echo "ERROR: AUTOMERKADO_SKIP_REMOTE_BUILD=1 but .next/BUILD_ID is missing." >&2
    echo "  On Mac run: npm run build:linux-docker && ./deploy.sh --prebuilt" >&2
    exit 1
  fi
  echo "→ Skipping next build on VPS (using synced .next from Linux Docker build)"
else
  if pgrep -af 'next-server' >/dev/null 2>&1; then
    echo "ERROR: next-server still running — build will OOM. Run as appuser and ensure PM2 stopped." >&2
    pgrep -af 'next-server' || true
    exit 1
  fi
  echo "→ next build on VPS (if this is Killed, use ./deploy.sh --prebuilt from your Mac)"
  # Do NOT set 4096 on a 4 GB VM — V8 heap + webpack native RSS exceeds RAM (see dmesg anon-rss ~3.7G).
  export NODE_OPTIONS='--max-old-space-size=1536'
  npm run build:vps
fi
npm run backfill:listing-thumbnails
if _deploy_pm2 describe automerkado >/dev/null 2>&1; then
  _deploy_pm2 restart automerkado
else
  echo "→ PM2 app missing — starting from ecosystem.config.cjs"
  _deploy_pm2 start ecosystem.config.cjs
  _deploy_pm2 save
fi
EOS
)

run_remote_deploy() {
  printf '%s' "$REMOTE_DEPLOY_BODY" | bash -s -- "$1"
}

if [[ "${1:-}" == "--server" || "${1:-}" == "--on-server" ]]; then
  repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  skip_build=0
  [[ "${2:-}" == "--no-build" || "${AUTOMERKADO_SKIP_REMOTE_BUILD:-}" == "1" ]] && skip_build=1
  if [[ "$(id -u)" -eq 0 ]]; then
    owner=$(stat -c '%U' "$repo" 2>/dev/null || true)
    if [[ -n "$owner" && "$owner" != "root" ]]; then
      echo "→ Re-running deploy as $owner (root cannot stop appuser PM2 / next-server)"
      exec sudo -u "$owner" -E env \
        AUTOMERKADO_DEPLOY_FREE_RAM="${AUTOMERKADO_DEPLOY_FREE_RAM:-}" \
        AUTOMERKADO_SKIP_REMOTE_BUILD="${skip_build}" \
        bash "$(readlink -f "${BASH_SOURCE[0]}")" --server $([[ "$skip_build" == 1 ]] && echo --no-build)
    fi
  fi
  echo "→ Server-only (${repo}) — skipping Mac build / rsync"
  AUTOMERKADO_SKIP_REMOTE_BUILD="$skip_build" run_remote_deploy "$repo"
  echo "✓ Deployed (server-only)"
  exit 0
fi

if [[ "${1:-}" == "--prebuilt" ]]; then
  echo "→ Mac: typecheck + Linux Docker build + rsync (no next build on VPS)"
  npm run typecheck
  npm run build:linux-docker
  echo "→ Syncing to $REMOTE:$DEST (including .next)"
  rsync -avz --delete \
    --exclude='.git' \
    --exclude='.env*' \
    --exclude='node_modules' \
    --exclude='prisma/*.db*' \
    --exclude='public/uploads' \
    --exclude='.DS_Store' \
    --exclude='terminals' \
    ./ "$REMOTE:$DEST/"
  echo "→ Remote: install + migrate + PM2 (skip build)"
  AUTOMERKADO_SKIP_REMOTE_BUILD=1 printf '%s' "$REMOTE_DEPLOY_BODY" | ssh "$REMOTE" bash -s -- "$DEST"
  echo "✓ Deployed (--prebuilt)"
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

echo "→ Remote: deps + migrate + build on Linux + backfill + PM2"
printf '%s' "$REMOTE_DEPLOY_BODY" | ssh "$REMOTE" bash -s -- "$DEST"

echo "✓ Deployed"
