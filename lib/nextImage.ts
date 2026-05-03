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
