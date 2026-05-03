import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Car as CarIcon,
  ChevronRight,
  Search,
  ShieldCheck,
} from "lucide-react";
import { POPULAR_CAR_BRANDS } from "@/lib/carBrands";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { RepossessedListingCountdownCard } from "@/components/listings/repossessed-listing-countdown";
import {
  listCars,
  type CarListItem,
} from "@/lib/repositories/carRepository";
import { getRepossessedListingExpiresAtIso } from "@/lib/repossessedListing";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Certified & repossessed cars in the Philippines",
  description:
    "Shop certified pre-owned and repossessed vehicles online. Transparent pricing, weekly Manila-time bidding windows, inspections, and local inventory updates.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "Automerkado · Certified & repossessed cars in the Philippines",
    description:
      "Find your next car—browse curated inventory with clear specs and a fair weekly bidding rhythm.",
    url: absoluteUrl("/"),
    type: "website",
  },
};

export default async function HomePage() {
  const featured: CarListItem[] = await listCars({ skip: 0, take: 12 });

  return (
    <div className="pb-16">
      <section className="relative isolate overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 select-none">
          <Image
            src="/bg_image.JPEG"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={82}
            className="object-cover object-[center_38%] sm:object-[center_42%] lg:object-[center_45%] motion-safe:scale-[1.04] motion-reduce:scale-100"
          />
        </div>
        {/* Readability & grade: stacked translucent scrims (no mix-blend quirks). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#07080c]/93 via-[#0d1117]/72 to-[#07080c]/91"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_115%_85%_at_78%_8%,rgba(207,21,32,0.11),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_12%_88%,rgba(255,255,255,0.04),transparent_50%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#050607]/80 via-[#0d1117]/40 to-transparent sm:h-[42%]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.055]"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8 lg:pb-16 lg:pt-16">
          <div className="flex max-w-2xl flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
              Drive with confidence
            </span>
          </div>
          <h1 className="mt-3 max-w-3xl text-[1.75rem] font-bold leading-[1.12] tracking-tight [text-shadow:0_1px_2px_rgb(0_0_0/0.22),0_10px_38px_rgb(0_0_0/0.35)] sm:mt-4 sm:text-5xl sm:leading-[1.1] lg:text-5xl">
            Find your next car on us.
          </h1>
          {/* <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            Certified and repossessed inventory, clear pricing, and weekly bidding
            on a Manila-time schedule (open Sat–Wed until 4:00 PM Wednesday).
          </p> */}

          <div className="mt-5 max-w-2xl sm:mt-7">
            <div className="rounded-2xl border border-white/15 bg-white p-2 shadow-soft sm:p-2">
              <form
                action="/listings/certified"
                method="get"
                className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
                role="search"
              >
                <label className="sr-only" htmlFor="hero-search-q">
                  Search listings
                </label>
                <div className="relative min-h-11 flex-1 sm:min-h-12">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
                    aria-hidden
                  />
                  <input
                    id="hero-search-q"
                    name="q"
                    type="search"
                    placeholder="Search by brand, model, title, or tag"
                    autoComplete="off"
                    className="min-h-11 w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-11 pr-4 text-base text-neutral-900 placeholder:text-neutral-500 outline-none transition-shadow focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/25 sm:min-h-12 sm:py-3"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-xl bg-brand px-6 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-95 active:opacity-90 sm:min-h-12"
                >
                  Search
                  <ChevronRight className="h-4 w-4 opacity-90" aria-hidden />
                </button>
              </form>
            </div>
            <div className="mt-3 sm:mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Popular brands
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-2 sm:gap-2">
                {POPULAR_CAR_BRANDS.map((brand) => (
                  <Link
                    key={brand}
                    href={`/listings/certified?brand=${encodeURIComponent(brand)}`}
                    className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/95 transition-colors hover:border-white/35 hover:bg-white/10 sm:px-3.5 sm:py-1.5 sm:text-sm"
                  >
                    {brand}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
            <Link
              href="/listings/certified"
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-opacity hover:opacity-95 sm:min-h-11 sm:w-auto sm:flex-none sm:px-6"
            >
              <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
              Certified Cars
            </Link>
            <Link
              href="/listings/repossessed"
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/[0.14] hover:border-white/40 sm:min-h-11 sm:w-auto sm:flex-none sm:px-6"
            >
              <CarIcon className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
              Repossessed Cars
            </Link>
            {/* <Link
              href="/register"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/25 bg-transparent px-5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/10 sm:min-h-11 sm:px-6"
            >
              Create account
            </Link> */}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Curated for you
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Featured vehicles
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted">
              Hand-picked from our current inventory. Tap a card for full specs and
              bidding.
            </p>
          </div>
          <Link
            href="/listings/certified"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            Browse all
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-5 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6">
          {featured.map((car) => {
            const img = car.images[0]?.path ?? "/car_images/IMG_01.webp";
            const high = car.bids[0]?.amount ?? car.price;
            const expiresIso = getRepossessedListingExpiresAtIso(
              car.category.slug,
              car.createdAt,
            );
            return (
              <li key={car.id}>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-card-hover">
                  <Link
                    href={`/listings/${car.slug}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                      <Image
                        src={img}
                        alt={car.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-5 pb-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                        {car.category.name}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-lg font-semibold leading-snug text-foreground">
                        {car.title}
                      </p>
                      <p className="mt-3 text-sm font-medium text-foreground">
                        From{" "}
                        <span className="tabular-nums">
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
                          href={`/listings/${car.category.slug}?tag=${encodeURIComponent(tag.slug)}`}
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
        <div className="mt-10 flex justify-center border-t border-border pt-7 pb-4 sm:pt-8 sm:pb-6">
          <Link
            href="/listings/certified"
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-surface hover:underline"
          >
            Browse all
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <TestimonialsSection />
    </div>
  );
}
