import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type CarListFilters = {
  categorySlug?: string;
  brand?: string;
  search?: string;
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

  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }

  if (filters.brand?.trim()) {
    where.brand = filters.brand.trim();
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { title: { contains: q } },
      { brand: { contains: q } },
      { model: { contains: q } },
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
  return prisma.car.count({ where: buildCarWhere(filters) });
}

const listCarsInclude = {
  category: true,
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  bids: {
    orderBy: { amount: "desc" as const },
    take: 1,
    select: { amount: true },
  },
} satisfies Prisma.CarInclude;

export type CarListItem = Prisma.CarGetPayload<{
  include: typeof listCarsInclude;
}>;

export async function listCars(
  filters: CarListFilters,
): Promise<CarListItem[]> {
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
  return prisma.car.findFirst({
    where: { slug, status: "LISTED" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      bids: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true, email: true } } },
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
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
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
