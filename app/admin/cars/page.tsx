import Image from "next/image";
import Link from "next/link";
import {
  AdminCarsMobileCard,
  AdminCarsTableRow,
} from "@/components/admin/admin-cars-clickable-row";
import { Car, PlusCircle, Search, X } from "lucide-react";
import {
  ADMIN_CARS_PAGE_SIZE,
  countAdminCars,
  listAdminCars,
} from "@/lib/repositories/carRepository";
import { isPublicUploadPath, listingThumbForUploadPath } from "@/lib/nextImage";

function buildCarsListUrl(page: number, q: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (q.trim()) params.set("q", q.trim());
  const s = params.toString();
  return s ? `/admin/cars?${s}` : "/admin/cars";
}

export default async function AdminCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const rawPage = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);

  const total = await countAdminCars(q);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_CARS_PAGE_SIZE));
  const page = Math.min(rawPage, totalPages);
  const skip = (page - 1) * ADMIN_CARS_PAGE_SIZE;

  const cars = await listAdminCars({
    q: q || undefined,
    skip,
    take: ADMIN_CARS_PAGE_SIZE,
  });

  const from = total === 0 ? 0 : skip + 1;
  const to = skip + cars.length;

  return (
    <div className="p-8">
      <div className="rounded-xl border border-surface bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Cars
            </h1>
            <p className="mt-1 text-sm text-muted">
              Create, edit, and manage inventory listings
            </p>
          </div>
          <Link
            href="/admin/cars/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-md shadow-brand/20 transition hover:opacity-95"
          >
            <PlusCircle className="h-4 w-4 shrink-0" aria-hidden />
            New car
          </Link>
        </div>

        <form
          method="GET"
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
          role="search"
        >
          <div className="min-w-0 flex-1">
            <label htmlFor="admin-cars-q" className="sr-only">
              Search cars
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                id="admin-cars-q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Search by title, brand, model, or slug…"
                className="w-full rounded-lg border border-surface bg-white py-2.5 pl-10 pr-3 text-sm text-foreground shadow-inner outline-none ring-brand/30 placeholder:text-muted focus:border-brand focus:ring-2"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2f3542] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d4454]"
            >
              <Search className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              Search
            </button>
            {q ? (
              <Link
                href="/admin/cars"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-surface bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-surface/80"
              >
                <X className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                Clear
              </Link>
            ) : null}
          </div>
        </form>

        <p className="mt-4 text-sm text-muted">
          {total === 0
            ? "No cars match your filters."
            : `Showing ${from}–${to} of ${total.toLocaleString("en-PH")} result${total === 1 ? "" : "s"}`}
        </p>
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-hidden rounded-xl border border-surface bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-surface bg-surface/60 text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="w-20 px-4 py-3" scope="col">
                  Photo
                </th>
                <th className="px-4 py-3" scope="col">
                  Listing
                </th>
                <th className="px-4 py-3" scope="col">
                  Category
                </th>
                <th className="px-4 py-3" scope="col">
                  Price
                </th>
                <th className="px-4 py-3" scope="col">
                  Status
                </th>
                <th className="px-4 py-3" scope="col">
                  Bidding
                </th>
                <th className="px-4 py-3 text-right" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <AdminCarsTableRow
                  key={car.id}
                  editHref={`/admin/cars/${car.id}/edit`}
                  title={car.title}
                >
                  <td className="px-4 py-3 align-middle">
                    <CarThumb path={car.images[0]?.path} title={car.title} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <p className="font-medium text-foreground">{car.title}</p>
                    <p className="mt-0.5 text-xs text-muted">/{car.slug}</p>
                  </td>
                  <td className="px-4 py-3 align-middle text-muted">
                    {car.category.name}
                  </td>
                  <td className="px-4 py-3 align-middle tabular-nums text-foreground">
                    PHP {Number(car.price).toLocaleString("en-PH")}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <StatusBadge status={car.status} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <BiddingLabel closed={car.biddingManuallyClosed} />
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <Link
                      href={`/admin/cars/${car.id}/edit`}
                      className="inline-flex font-semibold text-brand hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </AdminCarsTableRow>
              ))}
            </tbody>
          </table>
        </div>
        {cars.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted">
            No cars yet. Add your first listing to get started.
          </p>
        ) : null}
      </div>

      {/* Mobile cards */}
      <ul className="mt-6 flex flex-col gap-3 md:hidden">
        {cars.length === 0 ? (
          <li className="rounded-xl border border-surface bg-white px-4 py-12 text-center text-sm text-muted shadow-sm">
            No cars yet. Add your first listing to get started.
          </li>
        ) : (
          cars.map((car) => (
            <AdminCarsMobileCard
              key={car.id}
              editHref={`/admin/cars/${car.id}/edit`}
              title={car.title}
            >
              <div className="flex gap-3">
                <CarThumb path={car.images[0]?.path} title={car.title} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{car.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    /{car.slug}
                  </p>
                  <p className="mt-2 text-xs text-muted">{car.category.name}</p>
                  <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
                    PHP {Number(car.price).toLocaleString("en-PH")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={car.status} />
                    <BiddingLabel closed={car.biddingManuallyClosed} />
                  </div>
                  <p className="mt-3 text-xs font-medium text-brand/90">
                    Tap anywhere on this card to edit
                  </p>
                </div>
              </div>
            </AdminCarsMobileCard>
          ))
        )}
      </ul>

      {totalPages > 1 ? (
        <nav
          className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-surface bg-white px-4 py-3 shadow-sm"
          aria-label="Pagination"
        >
          <PaginationLink
            href={buildCarsListUrl(page - 1, q)}
            disabled={page <= 1}
            label="Previous"
          />
          <span className="px-2 text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <PaginationLink
            href={buildCarsListUrl(page + 1, q)}
            disabled={page >= totalPages}
            label="Next"
          />
        </nav>
      ) : null}
    </div>
  );
}

function CarThumb({ path, title }: { path?: string; title: string }) {
  const size = 56;
  if (!path) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg border border-dashed border-surface bg-surface/50 text-muted"
        style={{ width: size, height: size }}
      >
        <Car className="h-6 w-6" aria-hidden />
      </div>
    );
  }
  // Use the small WebP thumb generated at upload (lib/upload.ts). 56px row
  // thumb only needs ~56px CSS, so the 800px thumb is more than enough and
  // avoids loading multi-MB originals on every admin/cars table render.
  const src = listingThumbForUploadPath(path) ?? path;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-lg border border-surface bg-surface/30"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        unoptimized={isPublicUploadPath(src)}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        sizes="56px"
      />
      <span className="sr-only">{title}</span>
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

function BiddingLabel({ closed }: { closed: boolean }) {
  if (closed) {
    return (
      <span className="text-xs font-medium text-amber-800">Manual close</span>
    );
  }
  return <span className="text-xs text-muted">Open</span>;
}

function PaginationLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium text-muted">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-lg border border-surface px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-surface/80"
    >
      {label}
    </Link>
  );
}
