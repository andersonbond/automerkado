import { PAGE_SIZE } from "@/lib/constants";
import type { CarListFilters } from "@/lib/repositories/carRepository";

export function parseListingsSearchParams(
  sp: Record<string, string | string[] | undefined>,
): CarListFilters & { page: number } {
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const brand = typeof sp.brand === "string" && sp.brand ? sp.brand : undefined;
  const minPrice =
    typeof sp.minPrice === "string" && sp.minPrice
      ? Number(sp.minPrice)
      : undefined;
  const maxPrice =
    typeof sp.maxPrice === "string" && sp.maxPrice
      ? Number(sp.maxPrice)
      : undefined;
  const minYear =
    typeof sp.minYear === "string" && sp.minYear
      ? Number(sp.minYear)
      : undefined;
  const maxYear =
    typeof sp.maxYear === "string" && sp.maxYear
      ? Number(sp.maxYear)
      : undefined;
  const pageRaw = typeof sp.page === "string" ? Number(sp.page) : 1;
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  return {
    search: q,
    brand,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    minYear: Number.isFinite(minYear) ? minYear : undefined,
    maxYear: Number.isFinite(maxYear) ? maxYear : undefined,
    categorySlug: undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    page,
  };
}
