import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CarBidInspect } from "@/components/cars/car-bid-inspect";
import { isWeeklyBiddingOpen } from "@/lib/bidding/weeklyClose";
import { getCarBySlug } from "@/lib/repositories/carRepository";
import { Prisma } from "@prisma/client";

type Props = { params: Promise<{ slug: string }> };

function moneyPhp(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) return { title: "Not found" };
  const desc = `${car.year} ${car.brand} ${car.model}. ${car.description.slice(0, 140)}${car.description.length > 140 ? "…" : ""}`;
  return {
    title: car.title,
    description: desc,
    openGraph: {
      title: car.title,
      description: desc,
      type: "website",
    },
  };
}

export default async function CarDetailPage({ params }: Props) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) notFound();

  const high = car.bids[0]?.amount ?? new Prisma.Decimal(0);
  const minNext = car.bids.length
    ? high.add(new Prisma.Decimal(1000))
    : new Prisma.Decimal(car.price);
  const minBidHint = moneyPhp(minNext.toNumber());

  const weeklyOpen = isWeeklyBiddingOpen();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: car.title,
    description: car.description,
    brand: { "@type": "Brand", name: car.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "PHP",
      price: car.price.toString(),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="flex flex-wrap items-center gap-1 text-xs font-medium text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
        <Link href="/listings/certified" className="hover:text-foreground">
          Certified
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
        <span className="truncate text-foreground">{car.title}</span>
      </nav>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-widest text-brand">
        {car.category.name}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {car.title}
      </h1>
      <p className="mt-2 text-muted">
        {car.brand} {car.model} · {car.year}
      </p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground shadow-sm">
          List {moneyPhp(car.price.toNumber())}
        </span>
        <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground shadow-sm">
          High bid {car.bids.length ? moneyPhp(high.toNumber()) : "—"}
        </span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.85fr] lg:gap-12">
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {car.images.length ? (
              car.images.map((im) => (
                <div
                  key={im.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
                >
                  <Image
                    src={im.path}
                    alt={im.alt ?? car.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ))
            ) : (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface shadow-card sm:col-span-2">
                <Image
                  src="/car_images/IMG_01.webp"
                  alt={car.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            )}
          </div>
          <section className="mt-12">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-muted">
              {car.description}
            </p>
          </section>
          <section className="mt-12">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Bid history
            </h2>
            <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-card">
              {car.bids.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted">
                  No bids yet.
                </li>
              ) : (
                car.bids.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 text-sm"
                  >
                    <span className="font-medium text-foreground">
                      {moneyPhp(b.amount.toNumber())}
                    </span>
                    <span className="text-muted">
                      {b.user.name ?? "Bidder"} ·{" "}
                      {new Intl.DateTimeFormat("en-PH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(b.createdAt)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CarBidInspect
            carId={car.id}
            slug={car.slug}
            minBidHint={minBidHint}
            weeklyOpen={weeklyOpen}
            manualClosed={car.biddingManuallyClosed}
          />
        </div>
      </div>
    </div>
  );
}
