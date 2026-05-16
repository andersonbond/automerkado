import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { deactivateExpiredRepossessedListings } from "@/lib/services/repossessedExpiry";

export type CarListFilters = {
  categorySlug?: string;
  /** If set (non-empty), restricts to these category slugs; overrides `categorySlug`. */
  categorySlugs?: readonly string[];
  brand?: string;
  bodyType?: string;
  search?: string;
  tagSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  skip: number;
  take: number;
};

export function buildCarWhere(
  filters: Omit<CarListFilters, "skip" | "take">,
): Prisma.CarWhereInput {
  const where: Prisma.CarWhereInput = {
    status: "LISTED",
  };

  if (filters.categorySlugs && filters.categorySlugs.length > 0) {
    where.category = { slug: { in: [...filters.categorySlugs] } };
  } else if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }

  if (filters.brand?.trim()) {
    where.brand = filters.brand.trim();
  }

  if (filters.bodyType?.trim()) {
    where.bodyType = filters.bodyType.trim();
  }

  if (filters.tagSlug?.trim()) {
    where.tags = {
      some: { slug: filters.tagSlug.trim().toLowerCase() },
    };
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { title: { contains: q } },
      { brand: { contains: q } },
      { model: { contains: q } },
      { bodyType: { contains: q } },
      { tags: { some: { name: { contains: q } } } },
    ];
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {};
    if (filters.minPrice != null) where.price.gte = filters.minPrice;
    if (filters.maxPrice != null) where.price.lte = filters.maxPrice;
  }

  if (filters.minYear != null || filters.maxYear != null) {
    where.year = {};
    if (filters.minYear != null) where.year.gte = filters.minYear;
    if (filters.maxYear != null) where.year.lte = filters.maxYear;
  }

  return where;
}

export async function countCars(filters: Omit<CarListFilters, "skip" | "take">) {
  await deactivateExpiredRepossessedListings();
  return prisma.car.count({ where: buildCarWhere(filters) });
}

const listCarsInclude = {
  category: true,
  tags: { orderBy: { name: "asc" as const } },
  images: {
    orderBy: [{ isFeatured: "desc" as const }, { sortOrder: "asc" as const }],
    take: 1,
  },
  bids: {
    orderBy: { amount: "desc" as const },
    take: 1,
    select: { amount: true },
  },
} satisfies Prisma.CarInclude;

type CarListPayload = Prisma.CarGetPayload<{
  include: typeof listCarsInclude;
}>;

/** Explicit `tags` — Prisma `GetPayload` can infer `never` for implicit M2M `tags` in some TS versions. */
export type CarListItem = Omit<CarListPayload, "tags"> & {
  tags: { id: string; slug: string; name: string }[];
};

export async function listCars(
  filters: CarListFilters,
): Promise<CarListItem[]> {
  await deactivateExpiredRepossessedListings();
  const { skip, take, ...rest } = filters;
  return prisma.car.findMany({
    where: buildCarWhere(rest),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip,
    take,
    include: listCarsInclude,
  });
}

export async function getCarBySlug(slug: string) {
  await deactivateExpiredRepossessedListings();
  return prisma.car.findFirst({
    where: { slug, status: "LISTED" },
    include: {
      category: true,
      tags: { orderBy: { name: "asc" } },
      images: {
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
      },
      bids: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true, email: true } } },
      },
      inquiries: {
        where: {
          kind: "REPOSSESSED_BID",
          bidAmount: { not: null },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          firstName: true,
          bidAmount: true,
          createdAt: true,
        },
      },
    },
  });
}

/** Admin listing: all statuses, optional text search. */
export const ADMIN_CARS_PAGE_SIZE = 50;

function buildAdminCarSearchWhere(q?: string): Prisma.CarWhereInput {
  const trimmed = q?.trim();
  if (!trimmed) return {};
  return {
    OR: [
      { title: { contains: trimmed } },
      { brand: { contains: trimmed } },
      { model: { contains: trimmed } },
      { slug: { contains: trimmed } },
    ],
  };
}

const adminCarListInclude = {
  category: true,
  images: {
    orderBy: [{ isFeatured: "desc" as const }, { sortOrder: "asc" as const }],
    take: 1,
  },
} satisfies Prisma.CarInclude;

export type AdminCarListItem = Prisma.CarGetPayload<{
  include: typeof adminCarListInclude;
}>;

export async function countAdminCars(q?: string) {
  return prisma.car.count({ where: buildAdminCarSearchWhere(q) });
}

export async function listAdminCars(params: {
  q?: string;
  skip: number;
  take: number;
}): Promise<AdminCarListItem[]> {
  const { q, skip, take } = params;
  return prisma.car.findMany({
    where: buildAdminCarSearchWhere(q),
    orderBy: { updatedAt: "desc" },
    skip,
    take,
    include: adminCarListInclude,
  });
}

/** Tags that appear on at least one LISTED car in any of these categories (for listing filters). */
export async function listTagsForCategoriesListing(
  categorySlugs: readonly string[],
) {
  if (categorySlugs.length === 0) return [];
  return prisma.tag.findMany({
    where: {
      cars: {
        some: {
          status: "LISTED",
          category: { slug: { in: [...categorySlugs] } },
        },
      },
    },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function listTagsForCategoryListing(categorySlug: string) {
  return listTagsForCategoriesListing([categorySlug]);
}
