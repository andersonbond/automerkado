import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Car,
  Gavel,
  HardDrive,
  ImageIcon,
  Inbox,
  Megaphone,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { DashboardAnalytics } from "@/lib/services/dashboard";
import { BidsPerCarChart } from "@/components/admin/bids-per-car-chart";
import { CategoryPie } from "@/components/admin/category-pie";
import { formatStorageBytes } from "@/lib/uploadStorage";

const INQUIRY_KIND: Record<string, string> = {
  TEST_DRIVE: "Test drive",
  REPOSSESSED_BID: "Repo bid",
};

function formatShortDate(iso: Date | string): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function AdminDashboardView({ analytics: a }: { analytics: DashboardAnalytics }) {
  const attention = a.carsManualBidClosed > 0 ? 1 : 0;

  const headerDate = new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-full bg-gradient-to-b from-surface/60 via-background to-background px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px] space-y-10">
        {/* Header */}
        <header className="flex flex-col gap-6 border-b border-border/80 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Command center
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-[2rem]">
              Dashboard
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted">{headerDate}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/cars/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm shadow-brand/20 transition-opacity hover:opacity-95"
            >
              New listing
              <ArrowUpRight className="h-4 w-4 opacity-90" aria-hidden />
            </Link>
            <Link
              href="/admin/inquiries"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface"
            >
              Inbox
              <Inbox className="h-4 w-4 text-muted" aria-hidden />
            </Link>
          </div>
        </header>

        <SiteStorageUsage
          uploadBytes={a.siteStorageUploadBytes}
          usedBytes={a.siteStorageUsedBytes}
          quotaBytes={a.siteStorageQuotaBytes}
        />

        {/* Hero metrics */}
        <section aria-labelledby="pulse-heading">
          <h2 id="pulse-heading" className="sr-only">
            Key metrics
          </h2>
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[0_24px_50px_-32px_rgb(15_23_42/0.35)] lg:col-span-5">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-brand/[0.12] blur-2xl"
              />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Listed vs total
                  </p>
                  <p className="mt-4 text-4xl font-bold tabular-nums tracking-tight text-foreground md:text-[2.75rem]">
                    {a.listedCars}
                    <span className="text-xl font-semibold text-muted"> / {a.totalCars}</span>
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Vehicles currently live on the site. Hidden or sold statuses lower the
                    first number only.
                  </p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/12 text-brand ring-1 ring-brand/15">
                  <Car className="h-6 w-6" aria-hidden strokeWidth={1.85} />
                </span>
              </div>
              <div className="relative mt-6 flex gap-8 border-t border-border/80 pt-5">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
                    Engagement
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                    {a.totalBids}{" "}
                    <span className="text-sm font-normal text-muted">lifetime bids</span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
                    Rolling 7d
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold tabular-nums text-foreground">
                    <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden />
                    {a.bidsLast7Days}
                    <span className="text-sm font-normal text-muted"> bids</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7 lg:gap-5">
              <MetricTile
                icon={Users}
                label="Users"
                value={a.totalUsers}
                subtitle={`${a.activeUsers} active (30d)`}
                tint="neutral"
              />
              <MetricTile
                icon={Inbox}
                label="Leads · 7 days"
                value={a.inquiriesLast7Days}
                subtitle={`${a.totalInquiries} all time`}
                tint="accent"
              />
              <MetricTile
                icon={Car}
                label="Live listings"
                value={a.listedCars}
                subtitle={`${a.totalCars} in CMS total`}
                tint="neutral"
              />
            </div>
          </div>
        </section>

        {/* Operational strip */}
        <section
          aria-labelledby="operations-heading"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <h2 id="operations-heading" className="sr-only">
            Operational stats
          </h2>
          <StatChip
            icon={BadgeCheck}
            title="Certified"
            value={a.certifiedCount}
            hint="Category count"
          />
          <StatChip
            icon={Gavel}
            title="Repossessed"
            value={a.repossessedCount}
            hint="Category count"
          />
          <StatChip
            icon={Megaphone}
            title="Manual bid close"
            value={a.carsManualBidClosed}
            hint={a.carsManualBidClosed ? "Review listing settings" : "None flagged"}
          />
          <StatChip
            icon={Users}
            title="Admins"
            value={a.adminUsers}
            hint="Console members"
          />
        </section>

        {/* Quick actions + spotlight */}
        <section className="grid gap-5 lg:grid-cols-3" aria-labelledby="shortcuts-heading">
          <div className="lg:col-span-2 space-y-3">
            <h2 id="shortcuts-heading" className="text-sm font-semibold text-foreground">
              Shortcuts
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <QuickLinkCard
                href="/admin/cars"
                icon={Car}
                title="Inventory"
                description="Browse, publish, attach media"
              />
              <QuickLinkCard
                href="/admin/inquiries"
                icon={Inbox}
                title="Inquiries"
                description="Requests & bids from listings"
              />
              <QuickLinkCard
                href="/admin/images"
                icon={ImageIcon}
                title="Images"
                description="Library & listing photos"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-surface/30 p-5 shadow-sm ring-1 ring-black/[0.03]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Pulse
                </p>
                <p className="mt-2 text-xl font-semibold text-foreground">Health</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted/60" aria-hidden />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Published blog posts:{" "}
              <strong className="font-semibold text-foreground">{a.publishedPosts}</strong>
              . Keep content fresh alongside inventory updates.
            </p>
            {attention ? (
              <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-3 text-xs font-medium leading-relaxed text-amber-950 ring-1 ring-amber-100">
                Heads up · you have actionable items ({attention} buckets). Review manual
                bidding locks on affected listings.
              </p>
            ) : (
              <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-3 text-xs font-medium leading-relaxed text-emerald-950 ring-1 ring-emerald-100/80">
                Nothing blocking the queue · great moment to audit photos and tags.
              </p>
            )}
          </div>
        </section>

        {/* Charts + activity */}
        <div className="grid gap-6 xl:grid-cols-12">
          <section className="xl:col-span-7">
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ring-black/[0.02] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Bid volume by listing
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Highest bid counts first — prioritize marketing or pricing on outliers.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <BidsPerCarChart data={a.bidsPerCar} />
              </div>
            </div>
          </section>

          <section className="space-y-6 xl:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ring-black/[0.02] sm:p-7">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Categories
              </h2>
              <p className="mt-1 text-sm text-muted">Certified versus repossessed mix.</p>
              <div className="mt-4">
                <CategoryPie certified={a.certifiedCount} repossessed={a.repossessedCount} />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-black/[0.02]">
              <div className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-7">
                <div>
                  <h2 className="font-semibold text-foreground">Recent inquiries</h2>
                  <p className="text-xs text-muted">Latest site submissions</p>
                </div>
                <Link
                  href="/admin/inquiries"
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  View all
                </Link>
              </div>
              <ul className="divide-y divide-border px-6 py-1 sm:px-7">
                {a.recentInquiries.length === 0 ? (
                  <li className="py-10 text-center text-sm text-muted">No inquiries yet.</li>
                ) : (
                  a.recentInquiries.map((r) => (
                    <li key={r.id} className="flex flex-col gap-1 py-3.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {INQUIRY_KIND[r.kind] ?? r.kind}
                        </span>
                        <span className="text-[11px] tabular-nums text-muted">
                          {formatShortDate(r.createdAt)}
                        </span>
                      </div>
                      <Link
                        href={`/listings/${r.carSlug}`}
                        className="text-xs text-muted transition-colors hover:text-brand"
                      >
                        {r.carTitle}
                      </Link>
                      <p className="text-xs text-muted">{r.firstName}</p>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SiteStorageUsage({
  uploadBytes,
  usedBytes,
  quotaBytes,
}: {
  uploadBytes: number;
  usedBytes: number;
  quotaBytes: number;
}) {
  const systemBytes = Math.max(0, usedBytes - uploadBytes);
  const pctRaw = quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;
  const barWidth = Math.min(100, Math.max(0, pctRaw));
  const pctRounded = Math.min(999, Math.round(pctRaw));
  const overBudget = usedBytes > quotaBytes;

  const title = `Total ${formatStorageBytes(usedBytes)} includes ${formatStorageBytes(uploadBytes)} in uploads plus ${formatStorageBytes(systemBytes)} allocated for system/runtime (e.g. Node). Compared to ${formatStorageBytes(quotaBytes)} reference budget. Override quota with ADMIN_IMAGE_STORAGE_QUOTA_MB; system allowance with ADMIN_SYSTEM_STORAGE_ALLOCATION_MB.`;

  const ariaUsed = `${formatStorageBytes(usedBytes)} of ${formatStorageBytes(quotaBytes)} used (${formatStorageBytes(uploadBytes)} uploads plus ${formatStorageBytes(systemBytes)} system allocation)`;

  return (
    <section
      className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm ring-1 ring-black/[0.02]"
      aria-labelledby="site-storage-heading"
      title={title}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${
              overBudget
                ? "bg-amber-50 text-amber-800 ring-amber-100"
                : "bg-brand/10 text-brand ring-brand/15"
            }`}
          >
            <HardDrive className="h-4 w-4" aria-hidden strokeWidth={1.85} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h2 id="site-storage-heading" className="text-sm font-semibold text-foreground">
                Site storage
              </h2>
              <span className="text-xs tabular-nums text-muted">
                <span className="font-medium text-foreground">{formatStorageBytes(usedBytes)}</span>
                <span> / {formatStorageBytes(quotaBytes)}</span>
                <span className="text-muted"> · {pctRounded}%</span>
                {overBudget ? (
                  <span className="ml-1 font-medium text-amber-800">Over budget</span>
                ) : null}
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 w-full min-w-0 overflow-hidden rounded-full bg-border/90 sm:max-w-md"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={quotaBytes}
              aria-valuenow={usedBytes}
              aria-label={ariaUsed}
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                  overBudget ? "bg-amber-500" : "bg-brand"
                }`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        </div>
        <Link
          href="/admin/images"
          className="shrink-0 self-end text-xs font-semibold text-brand hover:underline sm:self-center"
        >
          Manage images
        </Link>
      </div>
    </section>
  );
}

function MetricTile(props: {
  icon: typeof Users;
  label: string;
  value: number;
  subtitle: string;
  tint: "neutral" | "accent" | "amber";
}) {
  const { icon: Icon, label, value, subtitle, tint } = props;
  const iconWrap =
    tint === "accent"
      ? "bg-brand/12 text-brand ring-brand/12"
      : tint === "amber"
        ? "bg-amber-50 text-amber-800 ring-amber-100"
        : "bg-surface text-foreground ring-border";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-black/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${iconWrap}`}>
          <Icon className="h-5 w-5" aria-hidden strokeWidth={1.85} />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-2 text-xs leading-snug text-muted">{subtitle}</p>
    </div>
  );
}

function StatChip(props: {
  icon: typeof Car;
  title: string;
  value: number;
  hint: string;
}) {
  const Icon = props.icon;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-muted ring-1 ring-border">
          <Icon className="h-[18px] w-[18px]" aria-hidden size={18} strokeWidth={1.85} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted">
            {props.title}
          </p>
          <p className="text-xl font-bold tabular-nums text-foreground">{props.value}</p>
          <p className="truncate text-[11px] text-muted">{props.hint}</p>
        </div>
      </div>
    </div>
  );
}

function QuickLinkCard(props: {
  href: string;
  icon: typeof Car;
  title: string;
  description: string;
}) {
  const Icon = props.icon;
  return (
    <Link
      href={props.href}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-black/[0.02] transition-all hover:border-brand/25 hover:shadow-[0_20px_40px_-28px_rgb(207_21_32/0.55)] focus-visible:outline focus-visible:ring-2 focus-visible:ring-brand/30"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/[0.16]">
          <Icon className="h-5 w-5" aria-hidden strokeWidth={1.85} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{props.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{props.description}</p>
          <span className="mt-3 inline-flex items-center gap-0.5 text-xs font-semibold text-brand opacity-90 group-hover:opacity-100">
            Open
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
