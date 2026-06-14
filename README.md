# Automerkado

Production-oriented car marketplace with public listings, weekly bidding (Asia/Manila schedule), admin CMS, and analytics.

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4
- Prisma 5 + SQLite
- Auth.js (NextAuth v5) credentials provider
- Recharts (admin dashboard)
- Nodemailer (optional SMTP for bid confirmations)
- Lucide (header / admin icons)

Optional static assets can live under **`public/`** (e.g. **`public/car_images/`**). The seed creates **demo users**, **Certified** / **Repossessed** categories, and **no vehicles**—add inventory from **Admin → Cars**.

## Prerequisites

- Node.js 20+ (LTS recommended)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables and adjust secrets:

   ```bash
   cp .env.example .env
   ```

   Set `AUTH_SECRET` to a long random string (for example `openssl rand -base64 32`). Set `AUTH_URL` to your site origin (e.g. `http://localhost:3000` in development).

3. Create / migrate the database and seed bootstrap accounts and categories:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

   The SQLite file is created at `prisma/dev.db` (path relative to the `prisma` directory in `DATABASE_URL`).

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Production / Linux server (git stays clean)

- After `git pull`, install with **`npm ci`** — installs exactly what’s in **`package-lock.json`** and avoids surprise edits to that file from **`npm install`**.
- Prefer updating dependencies on your dev machine, commit the lockfile, then on the server: `npm ci`, `npm run build`, restart the app (e.g. PM2).
- **`prisma/prod.db`** is listed in `.gitignore`; keep production SQLite (and WAL sidecars) only on disk or backups, not in Git.
- **`AUTOMERKADO_APP_ROOT`** (optional, in `.env`): absolute path to the repo root (directory that contains `public/` and `package.json`). Sets where listing images and uploads are **written** and is used by the **`/uploads/...`** handler so reads match writes if `process.cwd()` is wrong under PM2/systemd.
- **Nginx**: if you serve `/uploads/` with `root` at the **repo** root, requests look for `./uploads/...` instead of **`./public/uploads/...`** and return 404. Prefer **`location / { proxy_pass http://127.0.0.1:3000; }`** for all traffic, **or** use `alias /home/.../automerkado/public/uploads/;` (with trailing slash rules) under `location ^~ /uploads/`.
- **Cloudflare**: use a Cache Rule to **Bypass** cache for **`/uploads/*`** so stale HTML 404s are not reused for image URLs. Also **Bypass** cache for **`/feeds/*`** so Meta’s scheduled fetch always gets the latest CSV (not a cached 404 from before the first export).
- **Listing-grid thumbnails**: each upload writes a small `<hash>_thumb.webp` next to the original. The grid (`/listings/*`) loads the thumb so total page weight is ~1 MB instead of dozens of MB. After deploying the grid-thumb change for the first time, run **`npm run backfill:listing-thumbnails`** on the server (already wired into `deploy.sh`) so legacy uploads also get thumbs.

## Deploy from macOS (`./deploy.sh`)

For production you can **build on your Mac** (avoids OOM on small Linux VPS during `next build`) and **rsync** the tree to the server, then install Linux-native dependencies and restart PM2.

1. **Once:** edit `deploy.sh` and set `REMOTE` (e.g. `appuser@your-server-ip`) and `DEST` (app directory on the server, e.g. `/home/appuser/automerkado`).
2. **Once:** `chmod +x deploy.sh`
3. **Once on the server:** run PM2 as **`appuser`** (not root), e.g. `pm2 start ecosystem.config.cjs && pm2 save` from `DEST`. Future deploys use `pm2 restart automerkado` from the script.
4. **SSH:** passwordless key login to `REMOTE` so `rsync` and `ssh` in the script do not hang on prompts.

Then from the project root on your Mac:

```bash
./deploy.sh
```

What it does:

1. Runs **`npm run build`** locally (Prisma generate/migrate against your dev DB, then Next production build).
2. **`rsync -avz --delete`** from the repo root to `REMOTE:$DEST/`, excluding among other things `.git`, `.env*`, **`node_modules`**, **`.next`** (the app is **built on the Linux host** after sync), **`prisma/*.db*`, **`public/uploads`**, and **`public/feeds/*.csv`** (production uploads and the generated Meta feed stay on the server).
3. **`ssh`**: **`npm install`**, **`npx prisma migrate deploy`**, **`pm2 stop`** (frees RAM on small VPS), **`rm -rf .next`**, **`npm run build:deploy`** (same as `build` but **`next build --no-lint`** to save memory), **`npm run backfill:listing-thumbnails`**, **`pm2 restart automerkado`**, **`npm run export:meta-inventory`**. Use **~2 GB swap** on **2 GB** RAM. Run builds as **`appuser`** (not root) so **`.next`** and **`prisma/*.db`** stay owned by the app user (root-owned **`.next`** causes **`EACCES`** for `appuser`). Always commit **`package-lock.json`**.

**Git workflow:** merge and push **`main`** from your Mac (and `origin`). Deploy does **not** rely on `git pull` on the server; the server tree is updated by rsync and may differ from a `git status` checkout there—that is normal if you keep a clone on the box only for convenience.

**Linux-only checkout on the VPS:** after **`git pull`**, run **`./deploy.sh --server`**. Plain **`./deploy.sh`** begins with **`npm run build`** (the “building locally” step) and commonly **OOM / SIGKILLs** **`next build`** on a **2 GB** box—`**--server`** skips that step and runs only **`build:deploy`**, **`pm2 stop`**, migrations, etc.

| Role  | Email                     | Password     |
| ----- | ------------------------- | ------------ |
| Admin | `admin@automerkado.local` | `ChangeMe123!` |
| User  | `buyer@automerkado.local` | `ChangeMe123!` |

Change these immediately in any shared or production environment.

## SMTP (bid confirmation emails)

When a user places a valid bid, the app attempts to send email via SMTP. If `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` are not set, the app logs a warning and continues (the bid is still saved).

## Scripts

| Command            | Description                |
| ------------------ | -------------------------- |
| `npm run dev`      | Development server         |
| `npm run build`    | Production build           |
| `npm run build:deploy` | Same as **`build`** but skips Next’s build-time ESLint (**`next build --no-lint`**) — use on small VPS to reduce **`next build`** memory |
| `npm run start`    | Start production server    |
| `npm run install:ci` | Same as `npm ci` (use on servers after pull) |
| `npm run lint`     | ESLint                     |
| `npm run db:migrate` | `prisma migrate dev`     |
| `npm run db:seed`  | Run `scripts/seed.ts`      |
| `npm run db:reset` | Reset DB + migrate + seed  |
| `npm run worker:repossessed-expiry` | Deactivate expired LISTED repossessed listings (scheduled worker) |
| `npm run export:meta-inventory` | Write **`public/feeds/meta-inventory.csv`** for Meta Messenger / AI vehicle catalog (all LISTED cars) |
| `npm run backfill:listing-thumbnails` | Generate `_thumb.webp` variants for any `CarImage` that's missing one (idempotent; safe to re-run) |
| `./deploy.sh` | From **Mac**: local sanity **`npm run build`**, **`rsync`**, then remote **`build:deploy`** + migrate + PM2 (see comments in script) |
| `./deploy.sh --server` | On **Linux repo clone**: skip Mac/rsync; **`npm install`**, migrate, **`build:deploy`**, backfill, PM2 (use **after `git pull`**) |

### Repossessed listing expiry (production cron)

Repossessed listings expire at **Wednesday 16:30** `Asia/Manila` per listing (same cutoff as the site countdown). Run the worker weekly so listings flip to inactive even when traffic is quiet. Use **`CRON_TZ=Asia/Manila`** so **16:30** is Manila wall time (GNU cron respects `CRON_TZ` per job).

Example (Wednesdays 16:30 Manila):

```cron
CRON_TZ=Asia/Manila
30 16 * * 3 cd /path/to/automerkado && npm run worker:repossessed-expiry
```

### Meta Messenger / AI inventory (daily CSV)

Meta can import vehicle inventory from a **public CSV URL**. The app generates **`public/feeds/meta-inventory.csv`** (all **LISTED** certified + repossessed cars) and serves it at:

```text
https://YOUR_DOMAIN/feeds/meta-inventory.csv
```

No login or token is required — `/feeds/*` is outside admin middleware and is served as a static file from `public/`.

**Requirements**

- Set **`NEXT_PUBLIC_SITE_URL`** in production `.env` (e.g. `https://automerkado.com`) so CSV rows contain correct absolute **`link`** and **`image_link`** URLs.
- After deploy, **`deploy.sh`** runs **`npm run export:meta-inventory`** so the URL returns **200** immediately.
- **`rsync --delete`** excludes **`public/feeds/*.csv`** so Mac deploys do not wipe the live feed on the server.

**Meta setup**

1. In Meta Commerce Manager / Messenger AI inventory settings, choose **Scheduled fetch → daily**.
2. Paste: `https://YOUR_DOMAIN/feeds/meta-inventory.csv`

**Daily cron** (refreshes inventory without redeploying; run as **`appuser`**):

```cron
CRON_TZ=Asia/Manila
0 2 * * * cd /home/appuser/automerkado && npm run export:meta-inventory >> /home/appuser/automerkado/logs/meta-inventory-export.log 2>&1
```

Manual run anytime:

```bash
cd ~/automerkado && npm run export:meta-inventory
```

**Verify public access** (no cookies):

```bash
curl -sI "https://YOUR_DOMAIN/feeds/meta-inventory.csv" | head -5
curl -s "https://YOUR_DOMAIN/feeds/meta-inventory.csv" | head -2
```

Expect **HTTP 200**, CSV header row, and data rows for LISTED cars that have at least one image.

## Project layout

- `scripts/` — Database seed (`seed.ts`), repossessed expiry worker (`repossessed-expiry-worker.ts`), Meta inventory CSV export (`export-meta-inventory-csv.ts`)
- `app/(site)/` — Public marketing + listings + auth pages
- `app/admin/` — Admin CMS (protected by middleware + role)
- `app/api/` — Route handlers (bids, inspections, register)
- `lib/actions/` — Server actions for admin mutations
- `lib/services/`, `lib/repositories/`, `lib/controllers/` — Layered domain logic
- `prisma/` — Schema and migrations (`scripts/seed.ts` seeds the DB)

## Bidding rules

- **Weekly window:** Bidding is allowed Monday–Tuesday and Wednesday until **4:00 PM** `Asia/Manila`. From Wednesday 4:00 PM through Sunday, new bids are rejected by the server.
- **Manual close:** Admins can toggle “Manually close bidding” per car in the CMS.
- **Minimum bid:** First bid must be at least the list price; subsequent bids must exceed the current high bid by at least PHP 1,000.

## Troubleshooting

### Native addons (`lightningcss`, `@next/swc-darwin-arm64`, …)

Delete `node_modules` and reinstall, or run `npm rebuild`. Binaries are platform-specific and can break after copying the project across machines.

### macOS: `code signature invalid` / `errno=85` on `@next/swc-darwin-arm64`

Often quarantine or a bad copy. From the project root try:

```bash
xattr -cr node_modules/@next/swc-darwin-arm64
```

Then run `npm run dev` again. If it still fails, remove `node_modules` and `package-lock.json` and run `npm install` fresh.

### Dev compile: “Request timed out after 3000ms” / Retrying when opening `/`

This app does **not** use `next/font/google` so first compile does not wait on Google Fonts. If you still see timeouts, Next is probably using the **WASM SWC fallback** (slow first compile)—fix the native SWC binary with the steps above, or wait for the first request to finish after retries.

### Deploy: `EACCES` / `permission denied` under `.next`

Some files were created as **root** (e.g. **`npm run build`** while logged in as root). The app and PM2 should run as **`appuser`**. Fix once:

```bash
sudo chown -R appuser:appuser /home/appuser/automerkado
sudo -u appuser rm -rf /home/appuser/automerkado/.next
```

Then build only as **`appuser`**, not root.

### Deploy: `Killed` / **`Next.js build worker exited ... signal: SIGKILL`** on the VPS

Same family: Linux **OOM killer** (RAM + no swap). Prefer **~2 GB swap**, use **`npm run build:deploy`** (skips build-time lint), stop the running app during **`next build`** (**`./deploy.sh`** does **`pm2 stop`** first), and keep **`eslint`** on your Mac/CI with **`npm run lint`**. **`./deploy.sh`** also uses **`npm install`** incrementally to reduce install spikes.

## License

Private / unlicensed unless you add one.
