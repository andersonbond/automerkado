import Link from "next/link";
import { auth } from "@/auth";
import { updatePasswordAction, updateProfileAction } from "@/lib/actions/settings";
import { prisma } from "@/lib/db";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) return null;

  const sp = await searchParams;

  return (
    <div className="p-8">
      <Link href="/admin" className="text-sm text-brand hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted">Account information</p>

      {sp.ok === "profile" ? (
        <p className="mt-4 text-sm text-green-700">Profile updated.</p>
      ) : null}
      {sp.ok === "password" ? (
        <p className="mt-4 text-sm text-green-700">Password updated.</p>
      ) : null}
      {sp.error ? (
        <p className="mt-4 text-sm text-red-600">Something went wrong. Try again.</p>
      ) : null}

      <section className="mt-8 max-w-xl rounded-lg border border-surface bg-white p-6">
        <h2 className="font-semibold">Profile</h2>
        <form action={updateProfileAction} className="mt-4 space-y-4">
          <label className="block text-sm font-medium">
            Name
            <input
              name="name"
              required
              defaultValue={user.name}
              className="mt-1 w-full rounded-md border border-surface px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              required
              defaultValue={user.email}
              className="mt-1 w-full rounded-md border border-surface px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
          >
            Save profile
          </button>
        </form>
      </section>

      <section className="mt-8 max-w-xl rounded-lg border border-surface bg-white p-6">
        <h2 className="font-semibold">Change password</h2>
        <form action={updatePasswordAction} className="mt-4 space-y-4">
          <label className="block text-sm font-medium">
            Current password
            <input
              name="currentPassword"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-surface px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            New password
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-md border border-surface px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-md border border-foreground px-4 py-2 text-sm font-semibold"
          >
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}
