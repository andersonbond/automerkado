import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ChevronDown, Palette, Shield, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { clearSiteLogoAction, updateSiteLogoAction } from "@/lib/actions/siteLogo";
import { updatePasswordAction, updateProfileAction } from "@/lib/actions/settings";
import { HeroBackgroundAdminPanel } from "@/components/admin/hero-background-settings";
import { SettingsFlashBanner } from "@/components/admin/settings-flash";
import { isPublicUploadPath } from "@/lib/nextImage";
import { prisma } from "@/lib/db";
import { getHeroVisualConfig } from "@/lib/siteHero";
import { getSiteLogoSrc } from "@/lib/siteLogo";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-foreground/15 transition-[box-shadow,border-color] placeholder:text-muted/80 focus:border-brand/35 focus-visible:ring-2 focus-visible:ring-brand/20";

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
  const heroCfg = await getHeroVisualConfig();
  const sp = await searchParams;

  return (
    <div className="min-h-full bg-gradient-to-b from-surface/70 via-background to-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand hover:text-brand/90 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden strokeWidth={2} />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Settings
            </h1>
            <p className="max-w-xl text-sm text-muted">
              Site visuals and your account — appearance on the left, profile on the right.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
            <Shield className="h-3.5 w-3.5" aria-hidden strokeWidth={1.85} />
            Admin only
          </span>
        </div>

        <SettingsFlashBanner searchParams={sp} />

        <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
          {/* Site appearance — primary column */}
          <div className="space-y-6 xl:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_50px_-36px_rgb(15_23_42/0.35)] ring-1 ring-black/[0.03]">
              <div className="border-b border-border/80 bg-gradient-to-r from-brand/8 via-card to-transparent px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/14 text-brand ring-1 ring-brand/20">
                    <Palette className="h-[18px] w-[18px]" aria-hidden strokeWidth={1.85} />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Public site
                    </p>
                    <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
                      Appearance
                    </h2>
                  </div>
                </div>
              </div>

              <div className="space-y-0 divide-y divide-border/80 px-5 py-4 sm:px-6">
                {/* Logo */}
                <div className="pb-5 pt-2">
                  <h3 className="text-sm font-semibold text-foreground">Logo</h3>
                  <p className="mt-0.5 text-xs text-muted">
                    Header, footer, admin sidebar, and default social image.
                  </p>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                    <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface/60 shadow-inner ring-1 ring-black/[0.04]">
                      <Image
                        src={logoSrc}
                        alt=""
                        width={64}
                        height={64}
                        className="h-full w-full object-contain p-1"
                        unoptimized={isPublicUploadPath(logoSrc)}
                      />
                    </span>
                    <div className="min-w-0 flex-1 space-y-3">
                      <form
                        action={updateSiteLogoAction}
                        encType="multipart/form-data"
                        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
                      >
                        <label className="block min-w-0 flex-1 text-xs font-medium text-foreground">
                          Replace
                          <input
                            name="logo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="mt-1.5 block w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-xs file:font-semibold file:text-brand-foreground sm:max-w-xs"
                          />
                        </label>
                        <button
                          type="submit"
                          className="h-10 shrink-0 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-sm transition-opacity hover:opacity-95 sm:w-auto sm:self-end"
                        >
                          Save logo
                        </button>
                      </form>
                      <form action={clearSiteLogoAction}>
                        <button
                          type="submit"
                          className="text-xs font-semibold text-muted underline decoration-border underline-offset-2 hover:text-foreground"
                        >
                          Reset to default
                        </button>
                      </form>
                      <details className="group rounded-lg border border-dashed border-border/90 bg-surface/25">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                          <span className="text-muted group-open:text-foreground">
                            Recommended logo specs
                          </span>
                          <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                        </summary>
                        <ul className="space-y-1.5 border-t border-border/60 px-3 py-2.5 text-xs leading-snug text-muted">
                          <li>
                            <strong className="font-medium text-foreground">Square:</strong> 512×512 px
                            (256×256 min); wide wordmarks ~640×160 (4∶1).
                          </li>
                          <li>
                            Header shows ~36px tall — aim for ≥2× in source. PNG/WebP with transparency preferred;
                            max <strong className="text-foreground">5 MB</strong>. Favicon stays{" "}
                            <code className="rounded bg-surface px-0.5 text-[10px]">public/logo.svg</code>.
                          </li>
                        </ul>
                      </details>
                    </div>
                  </div>
                </div>

                {/* Hero — inner panel without redundant outer section chrome */}
                <div className="pt-5">
                  <HeroBackgroundAdminPanel
                    previewSrc={heroCfg.src}
                    initialFocusX={heroCfg.focusX}
                    initialFocusY={heroCfg.focusY}
                    usesCustomUpload={heroCfg.usesCustomUpload}
                    isVideo={heroCfg.isVideo}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account — sticky narrower column */}
          <div className="xl:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_50px_-36px_rgb(15_23_42/0.28)] ring-1 ring-black/[0.03] xl:sticky xl:top-5">
              <div className="border-b border-border/80 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-foreground ring-1 ring-border">
                    <UserRound className="h-[18px] w-[18px]" aria-hidden strokeWidth={1.85} />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Your account
                    </p>
                    <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
                      Profile & security
                    </h2>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5 pt-4 sm:px-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Profile
                </h3>
                <form action={updateProfileAction} className="mt-3 space-y-3">
                  <label className="block text-xs font-medium text-foreground">
                    Name
                    <input
                      name="name"
                      required
                      defaultValue={user.name}
                      className={inputClass}
                      autoComplete="name"
                    />
                  </label>
                  <label className="block text-xs font-medium text-foreground">
                    Email
                    <input
                      name="email"
                      type="email"
                      required
                      defaultValue={user.email}
                      className={inputClass}
                      autoComplete="email"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-opacity hover:opacity-95"
                  >
                    Save profile
                  </button>
                </form>

                <div className="my-6 h-px bg-border/90" />

                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Password
                </h3>
                <form action={updatePasswordAction} className="mt-3 space-y-3">
                  <label className="block text-xs font-medium text-foreground">
                    Current
                    <input
                      name="currentPassword"
                      type="password"
                      required
                      className={inputClass}
                      autoComplete="current-password"
                    />
                  </label>
                  <label className="block text-xs font-medium text-foreground">
                    New
                    <input
                      name="newPassword"
                      type="password"
                      required
                      minLength={8}
                      className={inputClass}
                      autoComplete="new-password"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-black/[0.04] transition-colors hover:bg-surface/80 hover:border-brand/25"
                  >
                    Update password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
