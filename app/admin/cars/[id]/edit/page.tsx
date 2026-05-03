import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCarAction, updateCarAction } from "@/lib/actions/cars";
import { prisma } from "@/lib/db";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-surface bg-white px-3 py-2.5 text-sm text-foreground shadow-inner outline-none ring-brand/30 focus:border-brand focus:ring-2";
const labelClass = "block text-sm font-medium text-foreground";

export default async function EditCarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const car = await prisma.car.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!car) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const err = sp.error;

  return (
    <div className="p-8">
      <Link
        href="/admin/cars"
        className="text-sm font-medium text-brand hover:underline"
      >
        ← Back to cars
      </Link>

      <div className="mt-6 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit car</h1>
        <p className="mt-1 text-sm text-muted">
          Update listing details, status, and media. Changes apply immediately after save.
        </p>

        {err ? (
          <div
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {err === "slug"
              ? "That URL slug belongs to another car. Pick a unique slug."
              : err === "id"
                ? "Missing car identifier. Return to the car list and try again."
                : "Could not save. Check required fields and slug format."}
          </div>
        ) : null}

        <form action={updateCarAction} className="mt-8 space-y-6">
          <input type="hidden" name="id" value={car.id} />

          <section className="rounded-xl border border-surface bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Basics
            </h2>
            <div className="mt-4 space-y-4">
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
                className={inputClass}
              />
            </div>
          </section>

          <section className="rounded-xl border border-surface bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Pricing
            </h2>
            <div className="mt-4">
              <Field
                label="Price (PHP)"
                name="price"
                type="number"
                defaultValue={String(car.price)}
                required
                className={inputClass}
              />
            </div>
          </section>

          <section className="rounded-xl border border-surface bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Publishing
            </h2>
            <div className="mt-4 space-y-4">
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
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-surface bg-surface/30 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  name="biddingManuallyClosed"
                  defaultChecked={car.biddingManuallyClosed}
                  className="mt-0.5 rounded border-surface text-brand focus:ring-brand"
                />
                <span>
                  <span className="font-medium text-foreground">Manually close bidding</span>
                  <span className="mt-0.5 block text-muted">
                    When checked, buyers cannot place bids regardless of the weekly schedule.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-surface bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Description
            </h2>
            <label className={`${labelClass} mt-4`}>
              Full description
              <textarea
                name="description"
                required
                rows={8}
                defaultValue={car.description}
                className={inputClass}
              />
            </label>
          </section>

          <section className="rounded-xl border border-surface bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Add images
            </h2>
            <label className={`${labelClass} mt-4`}>
              Upload more photos
              <span className="mt-0.5 block text-xs font-normal text-muted">
                JPEG, PNG, or WebP. New files are appended after existing images.
              </span>
              <input
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="mt-2 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-foreground hover:file:opacity-95"
              />
            </label>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground shadow-sm hover:opacity-95"
            >
              Save changes
            </button>
            <Link
              href="/admin/cars"
              className="inline-flex items-center rounded-lg border border-surface px-6 py-2.5 text-sm font-medium text-foreground hover:bg-surface/80"
            >
              Cancel
            </Link>
          </div>
        </form>

        <section className="mt-8 rounded-xl border border-surface bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Current images</h2>
          <p className="mt-1 text-xs text-muted">
            Paths shown for reference; thumbnails reflect sort order.
          </p>
          {car.images.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No images on file.</p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-3">
              {car.images.map((im) => (
                <li
                  key={im.id}
                  className="overflow-hidden rounded-lg border border-surface bg-surface/20"
                >
                  <div className="relative h-24 w-32">
                    <Image
                      src={im.path}
                      alt={im.alt ?? ""}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                  <p className="max-w-[8rem] truncate px-2 py-1.5 text-xs text-muted">
                    {im.path}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form
          action={deleteCarAction}
          className="mt-8 rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm"
        >
          <input type="hidden" name="id" value={car.id} />
          <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
          <p className="mt-1 text-sm text-red-800/90">
            Delete this listing permanently. This cannot be undone.
          </p>
          <button
            type="submit"
            className="mt-4 rounded-lg border border-red-600 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50"
          >
            Delete car
          </button>
        </form>
      </div>
    </div>
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
