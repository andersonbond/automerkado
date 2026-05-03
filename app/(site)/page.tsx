import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search, ShieldCheck } from "lucide-react";
import { POPULAR_CAR_BRANDS } from "@/lib/carBrands";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import {
  listCars,
  type CarListItem,
} from "@/lib/repositories/carRepository";

export default async function HomePage() {
  const featured: CarListItem[] = await listCars({ skip: 0, take: 12 });

  return (
    <div className="pb-16">
      <section className="relative bg-hero text-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8 lg:pb-16 lg:pt-16">
          <div className="flex max-w-2xl flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden />
              Drive with confidence
            </span>
          </div>
          <h1 className="mt-3 max-w-3xl text-[1.75rem] font-bold leading-[1.12] tracking-tight sm:mt-4 sm:text-5xl sm:leading-[1.1] lg:text-5xl">
            Find your next car
          </h1>
          {/* <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            Certified and repossessed inventory, clear pricing, and weekly bidding
            on a Manila-time schedule (open Mon–Wed until 4:00 PM Wednesday).
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
                    placeholder="Search by brand, model, or title"
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
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-95 sm:min-h-11 sm:px-6"
            >
              View listings
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
            return (
              <li key={car.id}>
                <Link
                  href={`/listings/${car.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-card-hover"
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
                  <div className="p-5">
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
                  </div>
                </Link>
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
