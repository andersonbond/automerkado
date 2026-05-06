/**
 * User uploads are stored under `public/uploads/**` and exposed as `/uploads/...`.
 * Using `next/image` optimization for those paths runs the image through `/_next/image`,
 * which re-fetches the URL inside the Node process. On some production setups (reverse
 * proxy, `next start` cwd, or static offloading) that internal fetch can return HTML or
 * an empty body, and the optimizer responds with 400. Serving uploads unoptimized makes
 * the browser request `/uploads/...` directly, matching how `public/` is intended to work.
 */
export function isPublicUploadPath(src: string): boolean {
  return src.startsWith("/uploads/");
}

/**
 * Derives the listing-grid thumbnail URL written next to a `/uploads/images/...`
 * original by `writeListingThumbnail` (lib/upload.ts).
 *
 *   /uploads/images/abc123.jpg  →  /uploads/images/abc123_thumb.webp
 *
 * Returns null when the path doesn't match the canonical 32-hex/`.<ext>` shape
 * (e.g. legacy seed images, site logo, hero bg). Callers should fall back to the
 * original `path` in that case.
 *
 * Pure URL string transform — does NOT verify the file exists on disk. Existing
 * uploads need the backfill script to generate the missing thumb. Cards using
 * a thumb URL whose file hasn't been generated will get 404 from /uploads/* and
 * `next/image` will leave the slot blank, so always provide a fallback path.
 */
export function listingThumbForUploadPath(src: string): string | null {
  if (!src.startsWith("/uploads/images/")) return null;
  const m = src.match(/^(\/uploads\/images\/[a-f0-9]{32})\.[a-z0-9]+$/i);
  if (!m) return null;
  return `${m[1]}_thumb.webp`;
}
