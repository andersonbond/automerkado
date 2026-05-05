import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { postLoginDestination, sanitizeRelativeCallbackUrl } from "@/lib/authRedirects";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const safeCallback = sanitizeRelativeCallbackUrl(callbackUrl);

  const session = await auth();
  if (session?.user) {
    redirect(postLoginDestination(safeCallback, session.user.role));
  }

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Welcome back
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
        Sign in
      </h1>
      {/* <p className="mt-2 text-sm text-muted">
        New here?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p> */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-card">
        <LoginForm callbackUrl={safeCallback} />
      </div>
    </div>
  );
}
