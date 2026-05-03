import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

/** Long-lived session when “Remember me” is checked (30 days). */
const REMEMBER_MAX_SEC = 30 * 24 * 60 * 60;
/** Browser-session style: no remember (12 hours). */
const SESSION_MAX_SEC = 12 * 60 * 60;

function parseRememberMe(value: unknown): boolean {
  return (
    value === true ||
    value === "true" ||
    value === "on" ||
    value === "1"
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    // Ceiling for encoded JWT; actual idle length is enforced in jwt via sessionExpiresAt.
    maxAge: REMEMBER_MAX_SEC,
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember me", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        const rememberMe = parseRememberMe(credentials?.remember);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          rememberMe,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const rememberMe = user.rememberMe === true;
        token.rememberMe = rememberMe;
        const ttlSec = rememberMe ? REMEMBER_MAX_SEC : SESSION_MAX_SEC;
        token.sessionExpiresAt = Date.now() + ttlSec * 1000;
        token.role = user.role ?? "USER";
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
  events: {
    async signIn({ user }) {
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }
    },
  },
});
