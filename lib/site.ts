/**
 * Canonical site origin for metadata, sitemap, robots, and JSON-LD.
 * Prefer `NEXT_PUBLIC_SITE_URL` in production; `AUTH_URL` is a fallback.
 */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function siteUrlObject(): URL {
  return new URL(`${siteUrl()}/`);
}

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
