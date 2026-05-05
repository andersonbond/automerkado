import path from "path";

/**
 * Directory that contains `public/`, `app/`, `package.json`, etc.
 * Prefer `AUTOMERKADO_APP_ROOT` on servers where `process.cwd()` is unreliable (PM2, cron, systemd).
 */
export function getAppDeployRoot(): string {
  const raw = process.env.AUTOMERKADO_APP_ROOT?.trim();
  if (raw) return path.resolve(raw);
  return process.cwd();
}

/** Absolute path under `public/uploads/` (listing images, site logos, CMS files). */
export function resolvePublicUploadsPath(...segments: string[]): string {
  return path.join(getAppDeployRoot(), "public", "uploads", ...segments);
}
