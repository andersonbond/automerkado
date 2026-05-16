import { hasAuthSessionCookie } from "@/lib/auth-session-cookie";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge middleware stays free of `next-auth` / `@auth/core` / `jose` — pulling those
 * into the Edge bundle blows memory on small VPS builds (SIGKILL).
 *
 * Cookie presence gates `/admin/*`; {@link app/admin/layout.tsx} runs full `auth()`.
 */
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  /** Former "all listings" index — keep links working. */
  if (pathname === "/listings") {
    const url = req.nextUrl.clone();
    url.pathname = "/listings/certified";
    return NextResponse.redirect(url);
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  if (!hasAuthSessionCookie(req)) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-automerkado-admin-path", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin/:path*", "/listings"],
};
