/**
 * Only same-origin relative paths are allowed for post-login redirects (open-redirect safe).
 */
export function sanitizeRelativeCallbackUrl(candidate: string | undefined): string {
  if (!candidate || typeof candidate !== "string") return "/";
  const trimmed = candidate.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  return trimmed;
}

/**
 * After credentials sign-in: send admins to the CMS by default, unless they were
 * following a link into `/admin` or a public page (deep link).
 */
export function postLoginDestination(
  sanitizedCallbackUrl: string,
  role: string | undefined,
): string {
  if (role !== "ADMIN") return sanitizedCallbackUrl;
  const path = sanitizedCallbackUrl.split("?")[0] ?? "/";
  if (path.startsWith("/admin")) return sanitizedCallbackUrl;
  if (path === "/" || path === "") return "/admin";
  return sanitizedCallbackUrl;
}
