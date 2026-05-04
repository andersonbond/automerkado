import Image from "next/image";
import Link from "next/link";
import { ListingPhotoPlaceholder } from "@/components/cars/listing-photo-placeholder";
import type { Prisma } from "@prisma/client";
import { RepossessedListingCountdownCard } from "@/components/listings/repossessed-listing-countdown";
import { getRepossessedListingExpiresAtIso } from "@/lib/repossessedListing";
import { isPublicUploadPath } from "@/lib/nextImage";

type CarRow = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: Prisma.Decimal;
  createdAt: Date;
  category: { name: string; slug: string };
  tags: { slug: string; name: string }[];
  images: { path: string; alt: string | null }[];
  bids: { amount: Prisma.Decimal }[];
};

export function CarGrid({
  cars,
  listingBasePath,
}: {
  cars: CarRow[];
  listingBasePath: string;
}) {
  if (!cars.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-card">
        <p className="text-sm font-medium text-foreground">No matches</p>
        <p className="mt-2 text-sm text-muted">
          Try adjusting filters or clear brand/tag chips to see more vehicles.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => {
        const firstIm = car.images[0];
        const high = car.bids[0]?.amount ?? car.price;
        const expiresIso = getRepossessedListingExpiresAtIso(
          car.category.slug,
          car.createdAt,
        );
        return (
          <li key={car.id}>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-card-hover">
              <Link
                href={`/listings/${car.slug}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                  {firstIm?.path ? (
                    <Image
                      src={firstIm.path}
                      alt={firstIm.alt ?? car.title}
                      fill
                      unoptimized={isPublicUploadPath(firstIm.path)}
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <ListingPhotoPlaceholder className="absolute inset-0" />
                  )}
                </div>
                <div className="p-5 pb-3">
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
                  {expiresIso ? (
                    <RepossessedListingCountdownCard expiresAtIso={expiresIso} />
                  ) : null}
                </div>
              </Link>
              {car.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 border-t border-border/80 px-5 pb-4 pt-2">
                  {car.tags.map((tag) => (
                    <Link
                      key={tag.slug}
                      href={`${listingBasePath}?tag=${encodeURIComponent(tag.slug)}`}
                      className="inline-flex rounded-full bg-surface/90 px-2.5 py-0.5 text-[11px] font-semibold text-foreground ring-1 ring-border transition-colors hover:bg-brand/10 hover:text-brand hover:ring-brand/25"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
