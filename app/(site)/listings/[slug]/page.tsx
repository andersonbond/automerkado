import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CertifiedTestDriveForm, RepossessedBidLeadForm } from "@/components/cars/car-listing-lead-forms";
import { CarListingGallery } from "@/components/cars/car-listing-gallery";
import { RepossessedListingCountdownDetail } from "@/components/listings/repossessed-listing-countdown";
import { isWeeklyBiddingOpen } from "@/lib/bidding/weeklyClose";
import {
  CERTIFIED_CATEGORY_SLUG,
  REPOSSESSED_CATEGORY_SLUG,
} from "@/lib/carListingCategories";
import { getRepossessedListingExpiresAtIso } from "@/lib/repossessedListing";
import { getCarBySlug } from "@/lib/repositories/carRepository";
import { absoluteUrl } from "@/lib/site";
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
  if (!car) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }

  const desc = `${car.year} ${car.brand} ${car.model}. ${car.description.slice(0, 140)}${car.description.length > 140 ? "…" : ""}`;
  const canonical = absoluteUrl(`/listings/${car.slug}`);
  const imageRel = car.images[0]?.path ?? "/car_images/IMG_01.webp";
  const ogImage = absoluteUrl(imageRel);

  return {
    title: car.title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: car.title,
      description: desc,
      url: canonical,
      locale: "en_PH",
      siteName: "Automerkado",
      type: "website",
      images: [{ url: ogImage, alt: car.images[0]?.alt ?? car.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: car.title,
      description: desc,
      images: [ogImage],
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
  const canonical = absoluteUrl(`/listings/${car.slug}`);
  const imageUrls =
    car.images.length > 0
      ? car.images.map((im) => absoluteUrl(im.path))
      : [absoluteUrl("/car_images/IMG_01.webp")];

  const productLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "Vehicle"],
    name: car.title,
    description: car.description,
    image: imageUrls,
    sku: car.slug,
    url: canonical,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "PHP",
      price: car.price.toString(),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Automerkado",
      },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: car.category.name,
        item: absoluteUrl(`/listings/${car.category.slug}`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: car.title,
        item: canonical,
      },
    ],
  };

  const jsonLdGraph = [productLd, breadcrumbLd];

  const listingsHref = `/listings/${car.category.slug}`;
  const repossessedExpiresIso = getRepossessedListingExpiresAtIso(
    car.category.slug,
    car.createdAt,
  );

  const showLeadFormJump =
    car.category.slug === CERTIFIED_CATEGORY_SLUG ||
    car.category.slug === REPOSSESSED_CATEGORY_SLUG;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-xs font-medium text-muted"
      >
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
        <Link href={listingsHref} className="hover:text-foreground">
          {car.category.name}
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
      {car.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {car.tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/listings/${car.category.slug}?tag=${encodeURIComponent(tag.slug)}`}
              className="inline-flex rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm transition-colors hover:border-brand/35 hover:bg-brand/5"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground shadow-sm">
          List {moneyPhp(car.price.toNumber())}
        </span>
        {car.category.slug === REPOSSESSED_CATEGORY_SLUG ? (
          <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground shadow-sm">
            High bid {car.bids.length ? moneyPhp(high.toNumber()) : "—"}
          </span>
        ) : null}
        {showLeadFormJump ? (
          <a
            href="#listing-lead-form"
            aria-label={
              car.category.slug === CERTIFIED_CATEGORY_SLUG
                ? "Jump to test drive booking form"
                : "Jump to submit bid form"
            }
            className="lg:hidden inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-opacity hover:opacity-95 focus-visible:outline focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:opacity-90"
          >
            {car.category.slug === CERTIFIED_CATEGORY_SLUG
              ? "Test Drive"
              : "Submit Bid"}
          </a>
        ) : null}
      </div>

      {repossessedExpiresIso ? (
        <RepossessedListingCountdownDetail expiresAtIso={repossessedExpiresIso} />
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.85fr] lg:gap-12">
        <div>
          <CarListingGallery
            images={
              car.images.length > 0
                ? car.images.map((im) => ({
                    id: im.id,
                    path: im.path,
                    alt: im.alt,
                  }))
                : []
            }
            fallbackAlt={car.title}
          />
          <section className="mt-12">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-muted">
              {car.description}
            </p>
          </section>
          {car.category.slug === REPOSSESSED_CATEGORY_SLUG ? (
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
          ) : null}
        </div>
        <div
          id="listing-lead-form"
          className="scroll-mt-28 lg:sticky lg:top-24 lg:self-start"
        >
          {car.category.slug === CERTIFIED_CATEGORY_SLUG ? (
            <CertifiedTestDriveForm carId={car.id} />
          ) : car.category.slug === REPOSSESSED_CATEGORY_SLUG ? (
            <RepossessedBidLeadForm
              carId={car.id}
              minBidHint={minBidHint}
              minBidPhp={minNext.toNumber()}
              weeklyOpen={weeklyOpen}
              manualClosed={car.biddingManuallyClosed}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted shadow-card">
              <p>
                For questions about this listing, please{" "}
                <Link href="/contact" className="font-semibold text-brand hover:underline">
                  contact us
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
