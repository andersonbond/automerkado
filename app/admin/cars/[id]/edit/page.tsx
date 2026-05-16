import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlignLeft,
  ArrowLeft,
  Banknote,
  Car,
  CheckCircle2,
  ImagePlus,
  Megaphone,
  Star,
  Tag,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { PhpFormattedPriceInput } from "@/components/admin/php-formatted-price-input";
import { DeleteCarConfirm } from "@/components/admin/delete-car-confirm";
import { CAR_BODY_TYPES } from "@/lib/carBodyTypes";
import { updateCarAction } from "@/lib/actions/cars";
import { prisma } from "@/lib/db";
import { isPublicUploadPath, listingThumbForUploadPath } from "@/lib/nextImage";

const editCarPageInclude = {
  category: true,
  tags: { orderBy: { name: "asc" as const } },
  images: { orderBy: { sortOrder: "asc" as const } },
} as const;

type CarForEditPage = Omit<
  Prisma.CarGetPayload<{ include: typeof editCarPageInclude }>,
  "tags"
> & {
  tags: { id: string; slug: string; name: string }[];
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-brand/50 focus:ring-2 focus:ring-brand/15";
const labelClass = "block text-sm font-medium text-foreground";

export default async function EditCarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const created = sp.created === "1";
  const car = (await prisma.car.findUnique({
    where: { id },
    include: editCarPageInclude as unknown as Prisma.CarInclude,
  })) as CarForEditPage | null;
  if (!car) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const err = sp.error;
  const heroImage =
    car.images.find((i) => i.isFeatured) ?? car.images[0] ?? null;

  return (
    <div className="relative min-h-full overflow-hidden p-6 md:p-8 lg:p-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand/[0.05] via-transparent to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/cars"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to cars
        </Link>

        <header className="relative mt-6 overflow-hidden rounded-2xl border border-surface/80 bg-gradient-to-br from-card via-card to-brand/[0.04] p-6 shadow-sm ring-1 ring-black/[0.04] sm:flex sm:items-start sm:justify-between sm:gap-6 sm:p-7">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-md shadow-brand/20">
              <Car className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Edit listing
              </p>
              <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {car.title}
              </h1>
              <p className="mt-1 font-mono text-xs text-muted">/{car.slug}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-surface/80 px-2.5 py-0.5 text-xs font-medium text-muted ring-1 ring-surface">
                  {car.category.name}
                </span>
                <StatusBadge status={car.status} />
                {car.biddingManuallyClosed ? (
                  <span className="text-xs font-medium text-amber-800">
                    Bidding manually closed
                  </span>
                ) : (
                  <span className="text-xs text-muted">Bidding open</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {created ? (
          <div
            className="mt-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 shadow-sm"
            role="status"
          >
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
              aria-hidden
            />
            <p>
              Listing created. Add or reorder photos below, then save when you&apos;re done.
            </p>
          </div>
        ) : null}
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
                ? "That URL slug belongs to another car. Pick a unique slug."
                : err === "id"
                  ? "Missing car identifier. Return to the car list and try again."
                  : "Could not save. Check required fields and slug format."}
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Gallery first in DOM: appears above form on mobile */}
          <aside className="min-w-0 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-4 lg:self-start">
            <EditCarGallery
              formId={`edit-car-${car.id}`}
              images={car.images}
              heroPath={heroImage?.path}
              title={car.title}
            />
          </aside>

          <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-1">
            <form
              id={`edit-car-${car.id}`}
              action={updateCarAction}
              className="overflow-hidden rounded-2xl border border-surface/90 bg-card shadow-card ring-1 ring-black/[0.04]"
            >
              <div
                className="h-1 w-full bg-gradient-to-r from-brand via-brand/75 to-brand/35"
                aria-hidden
              />
              <input type="hidden" name="id" value={car.id} />

              <div className="space-y-8 px-5 py-7 sm:px-8 sm:py-9">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-10">
                  <div className="min-w-0 space-y-5">
                    <SectionHeading
                      icon={Car}
                      title="Vehicle details"
                      subtitle="Title, slug, and specs."
                    />
                    <Field
                      label="Title"
                      name="title"
                      defaultValue={car.title}
                      required
                      className={inputClass}
                    />
                    <Field
                      label="Slug (URL)"
                      name="slug"
                      defaultValue={car.slug}
                      required
                      className={inputClass}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Brand"
                        name="brand"
                        defaultValue={car.brand}
                        required
                        className={inputClass}
                      />
                      <Field
                        label="Model"
                        name="model"
                        defaultValue={car.model}
                        required
                        className={inputClass}
                      />
                    </div>
                    <Field
                      label="Year"
                      name="year"
                      type="number"
                      defaultValue={String(car.year)}
                      required
                      className={`${inputClass} max-w-[12rem]`}
                    />
                    <label className={labelClass}>
                      Body type
                      <select
                        name="bodyType"
                        defaultValue={car.bodyType ?? ""}
                        className={inputClass}
                      >
                        <option value="">— Not set</option>
                        {CAR_BODY_TYPES.map((bt) => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="min-w-0 space-y-8 lg:border-l lg:border-surface/80 lg:pl-10">
                    <div className="space-y-4">
                      <SectionHeading
                        icon={Banknote}
                        title="Price"
                        subtitle="List price in PHP. Optional sale price appears on the public listing as the original amount struck through, then a slash, then the sale amount."
                      />
                      <label className={labelClass}>
                        Price (PHP)
                        <PhpFormattedPriceInput
                          name="price"
                          required
                          defaultValue={String(car.price)}
                          className={inputClass}
                          placeholder="e.g. 1,250,000"
                        />
                      </label>
                      <label className={labelClass}>
                        Sale price (PHP)
                        <PhpFormattedPriceInput
                          name="salePrice"
                          defaultValue={
                            car.salePrice != null ? String(car.salePrice) : ""
                          }
                          className={inputClass}
                          placeholder="Optional — e.g. 1,100,000"
                        />
                      </label>
                    </div>
                    <div className="space-y-4 border-t border-surface/70 pt-8">
                      <SectionHeading
                        icon={Megaphone}
                        title="Publishing"
                        subtitle="Category, status, bidding."
                      />
                      <label className={labelClass}>
                        Category
                        <select
                          name="categoryId"
                          required
                          defaultValue={car.categoryId}
                          className={inputClass}
                        >
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
                          defaultValue={car.status}
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
                          defaultChecked={car.biddingManuallyClosed}
                          className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand"
                        />
                        <span>
                          <span className="font-medium text-foreground">
                            Manually close bidding
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            Buyers cannot bid while this is on.
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-surface/80 pt-10">
                  <SectionHeading
                    icon={AlignLeft}
                    title="Description"
                    subtitle="Full listing copy."
                  />
                  <label className={`${labelClass} mt-4`}>
                    Full description
                    <textarea
                      name="description"
                      required
                      rows={6}
                      defaultValue={car.description}
                      className={`${inputClass} resize-y min-h-[8rem]`}
                    />
                  </label>
                </div>

                <div className="border-t border-surface/80 pt-10">
                  <SectionHeading
                    icon={Tag}
                    title="Tags"
                    subtitle="Comma-separated labels shown on the site for filtering and search."
                  />
                  <label className={`${labelClass} mt-4`}>
                    Tags
                    <textarea
                      name="tags"
                      rows={2}
                      defaultValue={car.tags.map((t) => t.name).join(", ")}
                      className={`${inputClass} resize-y`}
                      placeholder="Full EV, PHEV"
                    />
                  </label>
                </div>

                <div className="border-t border-surface/80 pt-10">
                  <SectionHeading
                    icon={ImagePlus}
                    title="Add photos"
                    subtitle="New uploads are appended after existing images."
                  />
                  <label
                    className={`${labelClass} mt-4 flex cursor-pointer flex-col rounded-xl border-2 border-dashed border-surface/90 bg-surface/25 px-5 py-8 text-center transition hover:border-brand/40 hover:bg-brand/[0.03]`}
                  >
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-card text-brand shadow-sm ring-1 ring-surface/80">
                      <ImagePlus className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="mt-3 text-sm font-medium text-foreground">
                      Upload more images
                    </span>
                    <span className="mt-1 text-xs text-muted">
                      JPEG, PNG, or WebP · multiple files OK
                    </span>
                    <input
                      name="images"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="mt-5 block w-full text-xs text-muted file:mx-auto file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-brand-foreground file:shadow-sm hover:file:opacity-95"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-surface/80 bg-gradient-to-br from-surface/45 via-surface/25 to-transparent px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8">
                <p className="min-w-0 max-w-xl flex-1 text-xs leading-relaxed text-muted sm:py-0.5">
                  Saving updates the public listing when the car is active on the site.
                </p>
                <div className="flex shrink-0 flex-row flex-nowrap items-center justify-end gap-3">
                  <button
                    type="submit"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 transition hover:opacity-95 active:scale-[0.98] sm:px-6"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                    Save changes
                  </button>
                  <Link
                    href="/admin/cars"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-surface bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-surface/80 sm:px-6"
                  >
                    <X className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                    Cancel
                  </Link>
                </div>
              </div>
            </form>

            <DeleteCarConfirm carId={car.id} carTitle={car.title} />
          </div>
        </div>
      </div>
    </div>
  );
}

function EditCarGallery({
  formId,
  images,
  heroPath,
  title,
}: {
  formId: string;
  images: {
    id: string;
    path: string;
    alt: string | null;
    sortOrder: number;
    isFeatured: boolean;
  }[];
  heroPath?: string;
  title: string;
}) {
  const thumbs = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const hasFeatured = images.some((i) => i.isFeatured);

  return (
    <div className="overflow-hidden rounded-2xl border border-surface/90 bg-card shadow-card ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between border-b border-surface/80 bg-surface/30 px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Gallery</h2>
        <span className="text-xs tabular-nums text-muted">
          {images.length} photo{images.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-surface/80 to-surface/40">
        {heroPath ? (
          <Image
            src={listingThumbForUploadPath(heroPath) ?? heroPath}
            alt={images.find((i) => i.path === heroPath)?.alt ?? title}
            fill
            unoptimized={isPublicUploadPath(heroPath)}
            decoding="async"
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 380px"
            priority
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted">
            <Car className="h-12 w-12 opacity-40" aria-hidden />
            <p className="text-sm">No photos yet — upload below.</p>
          </div>
        )}
      </div>

      {thumbs.length > 0 ? (
        <fieldset className="border-0 p-0">
          <legend className="border-b border-surface/80 bg-surface/25 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
            Featured on site
          </legend>
          <p className="px-4 pt-3 text-[11px] leading-relaxed text-muted">
            Choose which image is shown first on the listing and on inventory cards. Submit
            with <span className="font-medium text-foreground">Save changes</span> below.
          </p>
          <ul className="grid grid-cols-4 gap-1.5 p-3 sm:gap-2 sm:p-4">
            {thumbs.map((im) => {
              const defaultOn =
                im.isFeatured || (!hasFeatured && im.id === thumbs[0]?.id);
              return (
                <li key={im.id} className="min-w-0">
                  <label className="block cursor-pointer">
                    <input
                      form={formId}
                      type="radio"
                      name="featuredImageId"
                      value={im.id}
                      defaultChecked={defaultOn}
                      className="peer sr-only"
                    />
                    <span className="relative block aspect-square overflow-hidden rounded-lg border-2 border-surface/80 bg-surface/30 ring-1 ring-black/[0.03] transition peer-checked:border-brand peer-checked:ring-2 peer-checked:ring-brand/20 hover:border-brand/35">
                      <Image
                        src={listingThumbForUploadPath(im.path) ?? im.path}
                        alt={im.alt ?? ""}
                        fill
                        unoptimized={isPublicUploadPath(im.path)}
                        loading="lazy"
                        decoding="async"
                        className="object-cover"
                        sizes="96px"
                      />
                      <span className="pointer-events-none absolute bottom-1 left-1 right-1 flex justify-center opacity-0 transition peer-checked:opacity-100">
                        <span className="inline-flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                          <Star className="h-2.5 w-2.5 fill-amber-300/90 text-amber-200" aria-hidden />
                          Featured
                        </span>
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : heroPath ? (
        <p className="border-t border-surface/80 px-4 py-3 text-center text-xs text-muted">
          Only cover image — add more from the form.
        </p>
      ) : null}

      <div className="border-t border-surface/80 px-4 py-3">
        <p className="text-[11px] leading-relaxed text-muted">
          Sort order is upload order. New photos append at the end after save.
        </p>
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
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-xs leading-relaxed text-muted">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "LISTED") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20">
        Active
      </span>
    );
  }
  if (status === "INACTIVE") {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-700/20">
        Inactive
      </span>
    );
  }
  if (status === "SOLD") {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-600/15">
        Sold
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted ring-1 ring-surface">
      {status}
    </span>
  );
}

function Field(props: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  className: string;
}) {
  return (
    <label className={labelClass}>
      {props.label}
      <input
        name={props.name}
        type={props.type ?? "text"}
        required={props.required}
        defaultValue={props.defaultValue}
        className={props.className}
      />
    </label>
  );
}
