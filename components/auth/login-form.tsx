"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postLoginDestination } from "@/lib/authRedirects";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-shadow focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/20";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      remember: remember ? "true" : "false",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    const session = await getSession();
    const destination = postLoginDestination(callbackUrl, session?.user?.role);
    router.push(destination);
    router.refresh();
  }

  return (
    <form
      method="post"
      autoComplete="on"
      onSubmit={onSubmit}
      className="flex flex-col gap-5"
    >
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-950/50 dark:text-red-100">
          {error}
        </p>
      ) : null}
      <div className="block text-sm font-medium text-foreground">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          inputMode="email"
          className={inputClass}
        />
      </div>
      <div className="block text-sm font-medium text-foreground">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand/30"
        />
        <span>
          <span className="font-medium">Remember me</span>
          <span className="mt-0.5 block text-xs font-normal text-muted">
            Stay signed in on this device for up to 30 days. Uncheck to sign out
            after 12 hours of inactivity.
          </span>
        </span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
