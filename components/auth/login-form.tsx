"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-shadow focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/20";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-950/50 dark:text-red-100">
          {error}
        </p>
      ) : null}
      <label className="block text-sm font-medium text-foreground">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium text-foreground">
        Password
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>
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
