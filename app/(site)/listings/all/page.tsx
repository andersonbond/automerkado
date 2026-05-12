import type { Metadata } from "next";
import { CarGrid } from "@/components/listings/car-grid";
import { ListingsFilters } from "@/components/listings/listings-filters";
import { Pagination } from "@/components/listings/pagination";
import { PUBLIC_LISTING_CATEGORY_SLUGS } from "@/lib/carListingCategories";
import { PAGE_SIZE } from "@/lib/constants";
import { parseListingsSearchParams } from "@/lib/listingsParams";
import {
  countCars,
  listCars,
  listTagsForCategoriesListing,
} from "@/lib/repositories/carRepository";
import { absoluteUrl } from "@/lib/site";

const basePath = "/listings/all";

export const metadata: Metadata = {
  title: "Browse all listings",
  description:
    "Search certified and repossessed vehicles in one place. Filter by brand, price, tags, and model year.",
  alternates: { canonical: absoluteUrl(basePath) },
  openGraph: {
    title: "All listings | Automerkado",
    description:
      "Find certified pre-owned and repossessed inventory with one search.",
    url: absoluteUrl(basePath),
    type: "website",
  },
};

export default async function AllListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const base = parseListingsSearchParams(sp);
  const { page, ...rest } = base;
  const listFilters = {
    ...rest,
    categorySlug: undefined,
    categorySlugs: PUBLIC_LISTING_CATEGORY_SLUGS,
  };

  const [total, cars, tagOptions] = await Promise.all([
    countCars(listFilters),
    listCars(listFilters),
    listTagsForCategoriesListing(PUBLIC_LISTING_CATEGORY_SLUGS),
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
          Certified & repossessed
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Search all inventory
        </h1>
        <p className="mt-2 text-sm text-muted">
          {total} vehicle{total === 1 ? "" : "s"} matching your filters — certified
          and repossessed
        </p>
      </div>
      <div className="mt-10">
        <ListingsFilters basePath={basePath} tagOptions={tagOptions} />
      </div>
      <div className="mt-10">
        <CarGrid cars={cars} listingBasePath={basePath} />
      </div>
      <Pagination
        basePath={basePath}
        page={page}
        totalPages={totalPages}
        query={query}
      />
    </div>
  );
}
