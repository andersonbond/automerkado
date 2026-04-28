import type { Metadata } from "next";
import { CarGrid } from "@/components/listings/car-grid";
import { ListingsFilters } from "@/components/listings/listings-filters";
import { Pagination } from "@/components/listings/pagination";
import { PAGE_SIZE } from "@/lib/constants";
import { parseListingsSearchParams } from "@/lib/listingsParams";
import { countCars, listCars } from "@/lib/repositories/carRepository";

export const metadata: Metadata = {
  title: "Repossessed cars",
  description: "Browse repossessed vehicles on Automerkado.",
};

export default async function RepossessedListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const base = parseListingsSearchParams(sp);
  const { page, ...rest } = base;
  const listFilters = { ...rest, categorySlug: "repossessed" as const };

  const [total, cars] = await Promise.all([
    countCars(listFilters),
    listCars(listFilters),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const query = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (k === "page") return;
    if (typeof v === "string" && v) query.set(k, v);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Repossessed inventory
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Repossessed cars
        </h1>
        <p className="mt-2 text-sm text-muted">
          {total} vehicle{total === 1 ? "" : "s"} listed
        </p>
      </div>
      <div className="mt-10">
        <ListingsFilters basePath="/listings/repossessed" />
      </div>
      <div className="mt-10">
        <CarGrid cars={cars} />
      </div>
      <Pagination
        basePath="/listings/repossessed"
        page={page}
        totalPages={totalPages}
        query={query}
      />
    </div>
  );
}
