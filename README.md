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

Placeholder listing images live under **`public/car_images/`** (served as `/car_images/...`). The seed references `/car_images/IMG_01.webp`.

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

3. Create / migrate the database and seed demo data:

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

## Demo accounts (from seed)

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
| `npm run start`    | Start production server    |
| `npm run lint`     | ESLint                     |
| `npm run db:migrate` | `prisma migrate dev`     |
| `npm run db:seed`  | Run `prisma/seed.ts`       |
| `npm run db:reset` | Reset DB + migrate + seed  |

## Project layout

- `app/(site)/` — Public marketing + listings + auth pages
- `app/admin/` — Admin CMS (protected by middleware + role)
- `app/api/` — Route handlers (bids, inspections, register)
- `lib/actions/` — Server actions for admin mutations
- `lib/services/`, `lib/repositories/`, `lib/controllers/` — Layered domain logic
- `prisma/` — Schema, migrations, seed

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

## License

Private / unlicensed unless you add one.
