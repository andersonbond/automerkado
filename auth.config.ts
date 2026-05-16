import type { NextAuthConfig } from "next-auth";

/** Long-lived session when “Remember me” is checked (30 days). */
export const REMEMBER_MAX_SEC = 30 * 24 * 60 * 60;
/** Browser-session style: no remember (12 hours). */
export const SESSION_MAX_SEC = 12 * 60 * 60;

function parseRememberMe(value: unknown): boolean {
  return (
    value === true ||
    value === "true" ||
    value === "on" ||
    value === "1"
  );
}

/**
 * Edge-safe slice of Auth.js config — used by `middleware.ts` only.
 * Must not import Prisma, bcrypt, or other Node-only modules.
 *
 * Full credentials provider + DB touchpoints live in `auth.ts`.
 */
export default {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: REMEMBER_MAX_SEC,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const rememberMe = parseRememberMe((user as { rememberMe?: boolean }).rememberMe);
        token.rememberMe = rememberMe;
        const ttlSec = rememberMe ? REMEMBER_MAX_SEC : SESSION_MAX_SEC;
        token.sessionExpiresAt = Date.now() + ttlSec * 1000;
        token.role = (user as { role?: string }).role ?? "USER";
        token.sub = user.id;
      } else if (
        typeof token.sessionExpiresAt === "number" &&
        Date.now() > token.sessionExpiresAt
      ) {
        return null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
