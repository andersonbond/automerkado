import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  /** Former "all listings" index — keep links working. */
  if (pathname === "/listings") {
    const url = req.nextUrl.clone();
    url.pathname = "/listings/certified";
    return NextResponse.redirect(url);
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const role = req.auth?.user?.role;
  if (role === "ADMIN") return NextResponse.next();

  const login = new URL("/login", req.url);
  login.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(login);
});

export const config = {
  matcher: ["/admin/:path*", "/listings"],
};
