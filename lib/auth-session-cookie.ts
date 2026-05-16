import type { NextRequest } from "next/server";

/** Auth.js JWT session cookie names (@auth/core cookie utils). */
export const AUTH_SESSION_COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
] as const;

export function hasAuthSessionCookie(req: NextRequest): boolean {
  return AUTH_SESSION_COOKIE_NAMES.some((name) => req.cookies.has(name));
}
