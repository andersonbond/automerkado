import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import {
  clearSiteLogoAction,
  updateSiteLogoAction,
} from "@/lib/actions/siteLogo";
import { updatePasswordAction, updateProfileAction } from "@/lib/actions/settings";
import { isPublicUploadPath } from "@/lib/nextImage";
import { prisma } from "@/lib/db";
import { getSiteLogoSrc } from "@/lib/siteLogo";

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

  const logoSrc = await getSiteLogoSrc();

  const sp = await searchParams;

  return (
    <div className="p-8">
      <Link href="/admin" className="text-sm text-brand hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted">Account information</p>

      {sp.ok === "logo" ? (
        <p className="mt-4 text-sm text-green-700">Website logo updated.</p>
      ) : null}
      {sp.ok === "logo-clear" ? (
        <p className="mt-4 text-sm text-green-700">Website logo reset to default.</p>
      ) : null}
      {sp.ok === "profile" ? (
        <p className="mt-4 text-sm text-green-700">Profile updated.</p>
      ) : null}
      {sp.ok === "password" ? (
        <p className="mt-4 text-sm text-green-700">Password updated.</p>
      ) : null}
      {sp.error === "logo" ? (
        <p className="mt-4 text-sm text-red-600">
          Logo upload failed. Use JPEG, PNG, or WebP under 5&nbsp;MB.
        </p>
      ) : null}
      {sp.error && sp.error !== "logo" ? (
        <p className="mt-4 text-sm text-red-600">Something went wrong. Try again.</p>
      ) : null}

      <section className="mt-8 max-w-xl rounded-lg border border-surface bg-white p-6">
        <h2 className="font-semibold">Website logo</h2>
        <p className="mt-2 text-sm text-muted">
          Shown in the public header, footer, admin sidebar, and default social preview image.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted">Current preview</span>
            <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-surface bg-surface/40">
              <Image
                src={logoSrc}
                alt=""
                width={80}
                height={80}
                className="h-full w-full object-contain"
                unoptimized={isPublicUploadPath(logoSrc)}
              />
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <form action={updateSiteLogoAction} encType="multipart/form-data" className="space-y-3">
              <label className="block text-sm font-medium">
                Upload new logo
                <input
                  name="logo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="mt-1 w-full max-w-md text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-foreground"
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
              >
                Save logo
              </button>
            </form>
            <form action={clearSiteLogoAction}>
              <button
                type="submit"
                className="text-sm font-medium text-muted underline decoration-border underline-offset-2 hover:text-foreground"
              >
                Reset to default logo
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-border bg-surface/30 p-4 text-sm leading-relaxed text-muted">
          <p className="font-medium text-foreground">Recommended image specs</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong className="font-medium text-foreground">Square mark:</strong> at least{" "}
              <strong className="font-medium text-foreground">512×512 px</strong> (or{" "}
              <strong className="font-medium text-foreground">256×256 px</strong> minimum) so it
              stays sharp on retina screens and in Open Graph previews (~512×512).
            </li>
            <li>
              <strong className="font-medium text-foreground">Wide wordmark:</strong> around{" "}
              around <strong className="font-medium text-foreground">640×160 px</strong> (4:1) works if the
              mark is horizontal; it will scale to fit the header and footer.
            </li>
            <li>
              The nav shows the logo at roughly <strong className="font-medium text-foreground">36 px</strong>{" "}
              tall — use a source at least <strong className="font-medium text-foreground">2×</strong> that
              height for crisp raster logos.
            </li>
            <li>
              Prefer <strong className="font-medium text-foreground">PNG</strong> or{" "}
              <strong className="font-medium text-foreground">WebP</strong> with transparency on
              varied backgrounds; <strong className="font-medium text-foreground">JPEG</strong> if
              the artwork has no transparency.
            </li>
            <li>
              Maximum file size: <strong className="font-medium text-foreground">5 MB</strong>.
              Favicons still use the bundled SVG in <code className="text-xs">public/logo.svg</code>.
            </li>
          </ul>
        </div>
      </section>

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
