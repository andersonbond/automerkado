import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  ArrowLeft,
  Banknote,
  Car,
  CheckCircle2,
  ImagePlus,
  Megaphone,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { CarImagesFilePicker } from "@/components/admin/car-images-file-picker";
import { PhpFormattedPriceInput } from "@/components/admin/php-formatted-price-input";
import { prisma } from "@/lib/db";
import { createCarAction } from "@/lib/actions/cars";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-brand/50 focus:ring-2 focus:ring-brand/15";
const labelClass = "block text-sm font-medium text-foreground";

export default async function NewCarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const sp = await searchParams;
  const err = sp.error;

  return (
    <div className="relative min-h-full overflow-hidden p-6 md:p-8 lg:p-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand/[0.06] via-transparent to-transparent"
        aria-hidden
      />
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/admin/cars"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:gap-2.5 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to cars
        </Link>

        <header className="relative mt-6 overflow-hidden rounded-2xl border border-surface/80 bg-gradient-to-br from-card via-card to-brand/[0.04] p-6 shadow-sm ring-1 ring-black/[0.04] sm:flex sm:items-start sm:gap-5 sm:p-7">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-md shadow-brand/20">
            <Car className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="mt-4 sm:mt-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              New listing
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
              Fill in the details below — everything lives in one place. Status
              defaults to{" "}
              <span className="font-medium text-foreground">Active</span>.
            </p>
          </div>
        </header>

        {err ? (
          <div
            className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900 shadow-sm"
            role="alert"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
              !
            </span>
            <p>
              {err === "slug"
                ? "That URL slug is already used by another car. Choose a different slug."
                : "Could not save. Check required fields, slug format (lowercase letters, numbers, hyphens), and try again."}
            </p>
          </div>
        ) : null}

        <form
          action={createCarAction}
          className="mt-8 overflow-hidden rounded-2xl border border-surface/90 bg-card shadow-card ring-1 ring-black/[0.04]"
        >
          <div
            className="h-1 w-full bg-gradient-to-r from-brand via-brand/75 to-brand/40"
            aria-hidden
          />

          <div className="px-5 py-7 sm:px-8 sm:py-9">
            {/* Two columns: vehicle | price + publishing */}
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              <div className="min-w-0 space-y-5">
                <SectionHeading
                  icon={Car}
                  title="Vehicle details"
                  subtitle="Title, URL slug, and specs shown on the listing."
                />
                <Field label="Title" name="title" required className={inputClass} />
                <Field
                  label="Slug (URL)"
                  name="slug"
                  hint="Optional. Leave blank to auto-build from title (`my-car` style). Lowercase letters, numbers, hyphens."
                  className={inputClass}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Brand" name="brand" required className={inputClass} />
                  <Field label="Model" name="model" required className={inputClass} />
                </div>
                <Field
                  label="Year"
                  name="year"
                  type="number"
                  required
                  className={`${inputClass} max-w-[12rem]`}
                />
              </div>

              <div className="min-w-0 space-y-8 lg:border-l lg:border-surface/80 lg:pl-10">
                <div className="space-y-4">
                  <SectionHeading
                    icon={Banknote}
                    title="Price"
                    subtitle="Listed amount in PHP."
                  />
                  <label className={labelClass}>
                    Price (PHP)
                    <PhpFormattedPriceInput
                      name="price"
                      required
                      className={inputClass}
                      placeholder="e.g. 1,250,000"
                    />
                  </label>
                </div>

                <div className="space-y-4 border-t border-surface/70 pt-8">
                  <SectionHeading
                    icon={Megaphone}
                    title="Publishing"
                    subtitle="Category, status, and bidding."
                  />
                  <label className={labelClass}>
                    Category
                    <select name="categoryId" required className={inputClass}>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={labelClass}>
                    Status
                    <select
                      name="status"
                      defaultValue="LISTED"
                      className={inputClass}
                    >
                      <option value="LISTED">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SOLD">Sold</option>
                    </select>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-surface/90 bg-surface/35 px-4 py-3.5 text-sm transition hover:border-brand/25">
                    <input
                      type="checkbox"
                      name="biddingManuallyClosed"
                      className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand"
                    />
                    <span>
                      <span className="font-medium text-foreground">
                        Manually close bidding
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        Buyers cannot bid while this is on, regardless of the weekly
                        schedule.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4 border-t border-surface/80 pt-10">
              <SectionHeading
                icon={AlignLeft}
                title="Description"
                subtitle="Condition, features, and history — this sells the car."
              />
              <label className={labelClass}>
                Full description
                <textarea
                  name="description"
                  required
                  rows={6}
                  className={`${inputClass} resize-y min-h-[8rem]`}
                  placeholder="Condition, features, service history…"
                />
              </label>
            </div>

            <div className="mt-10 space-y-4 border-t border-surface/80 pt-10">
              <SectionHeading
                icon={Tag}
                title="Tags"
                subtitle="Comma-separated labels (e.g. Full EV, PHEV). Used on listings for browsing and search."
              />
              <label className={labelClass}>
                Tags
                <textarea
                  name="tags"
                  rows={2}
                  className={`${inputClass} resize-y`}
                  placeholder="Full EV, PHEV, Sunroof"
                />
              </label>
            </div>

            <div className="mt-10 space-y-4 border-t border-surface/80 pt-10">
              <SectionHeading
                icon={ImagePlus}
                title="Photos"
                subtitle="Optional — we use a placeholder if you skip this."
              />
              <CarImagesFilePicker />
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-surface/80 bg-gradient-to-br from-surface/45 via-surface/25 to-transparent px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="max-w-sm text-xs leading-relaxed text-muted">
              Saving adds this car to admin inventory right away. Active listings
              can appear on the public site.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 transition hover:opacity-95 active:scale-[0.98]"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                Create car
              </button>
              <Link
                href="/admin/cars"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface/80"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/12 text-brand ring-1 ring-brand/15">
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-xs leading-relaxed text-muted">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  hint,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  hint?: string;
  className: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input name={name} type={type} required={required} className={className} />
      {hint ? (
        <span className="mt-1.5 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
