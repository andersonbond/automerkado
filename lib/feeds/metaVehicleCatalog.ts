import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";

const META_CSV_COLUMNS = [
  "vehicle_id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "make",
  "model",
  "year",
  "body_style",
  "fuel_type",
  "custom_label_0",
] as const;

const DESCRIPTION_MAX_LEN = 5000;

export type MetaCatalogCar = Prisma.CarGetPayload<{
  include: {
    category: true;
    images: {
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }];
      take: 1;
    };
  };
}>;

export type MetaVehicleCatalogResult = {
  csv: string;
  rowCount: number;
  skippedNoImage: number;
};

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function plainDescription(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, DESCRIPTION_MAX_LEN);
}

function formatMetaPrice(
  price: Prisma.Decimal,
  salePrice: Prisma.Decimal | null,
): string {
  const amount = Math.round(Number(salePrice ?? price));
  return `${amount} PHP`;
}

function imageAbsoluteUrl(path: string): string {
  return path.startsWith("http://") || path.startsWith("https://")
    ? path
    : absoluteUrl(path.startsWith("/") ? path : `/${path}`);
}

function carToMetaRow(car: MetaCatalogCar): string[] | null {
  const imagePath = car.images[0]?.path;
  if (!imagePath) return null;

  return [
    car.id,
    car.title,
    plainDescription(car.description),
    "in stock",
    "used",
    formatMetaPrice(car.price, car.salePrice),
    absoluteUrl(`/listings/${car.slug}`),
    imageAbsoluteUrl(imagePath),
    car.brand,
    car.model,
    String(car.year),
    car.bodyType ?? "",
    car.fuelType ?? "",
    car.category.name,
  ];
}

export function buildMetaVehicleCatalogCsv(
  cars: MetaCatalogCar[],
): MetaVehicleCatalogResult {
  const rows: string[] = [META_CSV_COLUMNS.join(",")];
  let rowCount = 0;
  let skippedNoImage = 0;

  for (const car of cars) {
    const fields = carToMetaRow(car);
    if (!fields) {
      skippedNoImage += 1;
      continue;
    }
    rows.push(fields.map(escapeCsvField).join(","));
    rowCount += 1;
  }

  return { csv: `${rows.join("\n")}\n`, rowCount, skippedNoImage };
}

export async function fetchListedCarsForMetaCatalog(): Promise<MetaCatalogCar[]> {
  return prisma.car.findMany({
    where: { status: "LISTED" },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      category: true,
      images: {
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
    },
  });
}
