import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Join Automerkado
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
        Create account
      </h1>
      <p className="mt-2 text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-card">
        <RegisterForm />
      </div>
    </div>
  );
}
