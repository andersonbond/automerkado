import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  ArrowLeft,
  Banknote,
  Car,
  CheckCircle2,
  ImagePlus,
  Megaphone,
} from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { createCarAction } from "@/lib/actions/cars";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-surface/90 bg-white px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none ring-brand/20 transition placeholder:text-muted hover:border-surface focus:border-brand focus:ring-2 focus:ring-brand/25";
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
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand/[0.08] via-transparent to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/cars"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:gap-2.5 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to cars
        </Link>

        <header className="relative mt-6 overflow-hidden rounded-2xl border border-surface/80 bg-gradient-to-br from-white via-white to-brand/[0.06] p-6 shadow-md ring-1 ring-black/[0.04] sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/10 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-lg shadow-brand/25">
              <Car className="h-7 w-7" strokeWidth={1.75} aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                New listing
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                Build a clear, compelling listing. Status defaults to{" "}
                <span className="font-medium text-foreground">Active</span> so
                it can appear on the site once you save.
              </p>
            </div>
          </div>
        </header>

        {err ? (
          <div
            className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900 shadow-sm"
            role="alert"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
              !
            </span>
            <p>
              {err === "slug"
                ? "That URL slug is already used by another car. Choose a different slug."
                : "Could not save. Check required fields, slug format (lowercase letters, numbers, hyphens), and try again."}
            </p>
          </div>
        ) : null}

        <form action={createCarAction} className="mt-8 space-y-5">
          <FormSection
            icon={Car}
            title="Basics"
            description="Identity and core specs buyers see first."
          >
            <Field label="Title" name="title" required className={inputClass} />
            <Field
              label="Slug (URL)"
              name="slug"
              required
              hint="Lowercase letters, numbers, hyphens only."
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
              className={inputClass}
            />
          </FormSection>

          <FormSection
            icon={Banknote}
            title="Pricing"
            description="List price in Philippine peso."
          >
            <Field
              label="Price (PHP)"
              name="price"
              type="number"
              required
              className={inputClass}
            />
          </FormSection>

          <FormSection
            icon={Megaphone}
            title="Publishing"
            description="Category, visibility, and bidding controls."
          >
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
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-surface/80 bg-gradient-to-br from-surface/40 to-transparent px-4 py-3.5 text-sm shadow-sm transition hover:border-brand/25">
              <input
                type="checkbox"
                name="biddingManuallyClosed"
                className="mt-0.5 h-4 w-4 rounded border-surface text-brand focus:ring-brand"
              />
              <span>
                <span className="font-medium text-foreground">
                  Manually close bidding
                </span>
                <span className="mt-0.5 block text-muted">
                  When checked, buyers cannot place bids regardless of the weekly
                  schedule.
                </span>
              </span>
            </label>
          </FormSection>

          <FormSection
            icon={AlignLeft}
            title="Description"
            description="Condition, features, and history help bids convert."
          >
            <label className={labelClass}>
              Full description
              <textarea
                name="description"
                required
                rows={8}
                className={`${inputClass} resize-y min-h-[10rem]`}
                placeholder="Condition, features, service history…"
              />
            </label>
          </FormSection>

          <FormSection
            icon={ImagePlus}
            title="Media"
            description="Optional uploads — we add a placeholder if you skip."
          >
            <label
              className={`${labelClass} flex cursor-pointer flex-col rounded-xl border-2 border-dashed border-surface/90 bg-surface/20 px-4 py-8 text-center transition hover:border-brand/35 hover:bg-brand/[0.03]`}
            >
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand shadow-sm ring-1 ring-surface/80">
                <ImagePlus className="h-5 w-5" aria-hidden />
              </span>
              <span className="mt-3 text-sm font-medium text-foreground">
                Drop images or browse
              </span>
              <span className="mt-1 text-xs text-muted">
                JPEG, PNG, or WebP — multiple files allowed
              </span>
              <input
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="mt-4 block w-full text-xs text-muted file:mx-auto file:mr-0 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand-foreground file:shadow-sm hover:file:opacity-95"
              />
            </label>
          </FormSection>

          <div className="flex flex-col gap-3 rounded-2xl border border-surface/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted sm:max-w-xs">
              Saving publishes to admin inventory immediately. Active cars can
              appear on the public site.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition hover:opacity-95 active:scale-[0.98]"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                Create car
              </button>
              <Link
                href="/admin/cars"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface/70"
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

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-surface/80 bg-white shadow-sm ring-1 ring-black/[0.03] transition hover:shadow-md">
      <div
        className="absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl bg-gradient-to-b from-brand via-brand/70 to-brand/30"
        aria-hidden
      />
      <div className="p-6 pl-5 sm:p-7 sm:pl-6">
        <div className="flex gap-3 sm:gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand shadow-inner ring-1 ring-brand/10">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 pt-0.5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-5 space-y-4">{children}</div>
      </div>
    </section>
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
      {hint ? <span className="mt-1.5 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
