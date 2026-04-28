import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

type CarRow = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: Prisma.Decimal;
  category: { name: string };
  images: { path: string; alt: string | null }[];
  bids: { amount: Prisma.Decimal }[];
};

export function CarGrid({ cars }: { cars: CarRow[] }) {
  if (!cars.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-card">
        <p className="text-sm font-medium text-foreground">No matches</p>
        <p className="mt-2 text-sm text-muted">
          Try adjusting filters or clear the brand chip to see more vehicles.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => {
        const img = car.images[0]?.path ?? "/car_images/IMG_01.webp";
        const high = car.bids[0]?.amount ?? car.price;
        return (
          <li key={car.id}>
            <Link
              href={`/listings/${car.slug}`}
              className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-card-hover"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                <Image
                  src={img}
                  alt={car.images[0]?.alt ?? car.title}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {car.category.name}
                </p>
                <p className="mt-1.5 line-clamp-2 text-lg font-semibold leading-snug text-foreground">
                  {car.title}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {car.brand} {car.model} · {car.year}
                </p>
                <p className="mt-3 text-sm">
                  <span className="text-muted">From </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    PHP {Number(high).toLocaleString("en-PH")}
                  </span>
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
