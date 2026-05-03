import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
    };
  }

  interface User {
    role?: string;
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    rememberMe?: boolean;
    /** Epoch ms when this login should be treated as expired. */
    sessionExpiresAt?: number;
  }
}
