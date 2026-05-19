#!/usr/bin/env bash
#
# From your Mac (sanity Next build here + rsync + remote Linux build):
#   ./deploy.sh
#
# On the VPS alone (SKIP the Mac-era “build locally” step — avoids OOM on 2 GB RAM):
#   ./deploy.sh --server
# Run as appuser, NOT root — root `pm2 stop` does not stop appuser's next-server (OOM during build).
# On 2 GB VPS: AUTOMERKADO_DEPLOY_FREE_RAM=1 ./deploy.sh --server — run `npm run typecheck` on Mac first (VPS skips tsc).
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
# Single webpack process (experimental.webpackBuildWorker: false): one Node heap spike — cap 1024 MiB.
export NODE_OPTIONS='--max-old-space-size=1024'
npm run build:vps
npm run backfill:listing-thumbnails
_deploy_pm2 restart automerkado
EOS
)

run_remote_deploy() {
  printf '%s' "$REMOTE_DEPLOY_BODY" | bash -s -- "$1"
}

if [[ "${1:-}" == "--server" || "${1:-}" == "--on-server" ]]; then
  repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if [[ "$(id -u)" -eq 0 ]]; then
    owner=$(stat -c '%U' "$repo" 2>/dev/null || true)
    if [[ -n "$owner" && "$owner" != "root" ]]; then
      echo "→ Re-running deploy as $owner (root cannot stop appuser PM2 / next-server)"
      exec sudo -u "$owner" -E env AUTOMERKADO_DEPLOY_FREE_RAM="${AUTOMERKADO_DEPLOY_FREE_RAM:-}" \
        bash "$(readlink -f "${BASH_SOURCE[0]}")" --server
    fi
  fi
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

# OOM: `/swapfile` already exists if you see "Text file busy" — add *second* swap instead:
#   sudo swapon --show
#   sudo fallocate -l 2G /swapfile2 && sudo chmod 600 /swapfile2 && sudo mkswap /swapfile2 && sudo swapon /swapfile2
#   echo '/swapfile2 none swap sw 0 0' | sudo tee -a /etc/fstab
# Optional: free RAM during `next build` if you use passwordless sudo (stops Postgres; app uses SQLite):
#   AUTOMERKADO_DEPLOY_FREE_RAM=1 ./deploy.sh --server
echo "→ Remote: deps + migrate + build on Linux + backfill + PM2"
printf '%s' "$REMOTE_DEPLOY_BODY" | ssh "$REMOTE" bash -s -- "$DEST"

echo "✓ Deployed"
