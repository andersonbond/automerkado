import Image from "next/image";
import { ChevronsLeftRight, Quote, Star } from "lucide-react";

type Testimonial = {
  quote: string;
  name: string;
  /** Path under `/public`, e.g. `/car_images/testimonials/james.jpg` */
  photo: string;
  subtitle?: string;
};

/** Filenames expected under `public/car_images/testimonials/` (match your JPG names). */
const ITEMS: Testimonial[] = [
  {
    name: "James",
    photo: "/car_images/testimonials/james.jpg",
    quote:
      "I highly recommend them! Their team was very professional and made the entire process fast and smooth. Reliable service and very helpful with all my questions.",
  },
  {
    name: "Ronalyn Cala",
    photo: "/car_images/testimonials/ronalyn.jpg",
    subtitle: "Purchased Nissan Navara EL · 2018",
    quote:
      "We recently purchased a vehicle - Nissan Navara EL 2018 and had an outstanding experience from start to finish.",
  },
  {
    name: "Francis",
    photo: "/car_images/testimonials/francis.jpg",
    quote:
      "Set the bar across the board for a perfect customer experience.",
  },
  {
    name: "Martin",
    photo: "/car_images/testimonials/martin.jpg",
    quote:
      "Thank you so much sa walay hasul nga transaction, atimanon pajud tas ila staff.",
  },
  {
    name: "Bong",
    photo: "/car_images/testimonials/bong.jpg",
    quote:
      "Very professional, trustworthy and honest. Replies fast with all my inquiries. It took only 4 days to finished the transaction and it was delivered on time at the right place. I will surely come back.",
  },
];

const cardClassName =
  "group relative flex h-full min-h-[13.5rem] w-[min(82vw,18.25rem)] shrink-0 snap-center flex-col rounded-2xl border border-border/80 bg-card p-4 shadow-card ring-1 ring-black/[0.03] transition-all duration-300 hover:border-brand/20 hover:shadow-card-hover dark:ring-white/[0.04] md:min-h-0 md:w-auto md:snap-none";

export function TestimonialsSection() {
  return (
    <section
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      aria-labelledby="testimonials-heading"
    >
      <div className="mt-8 sm:mt-10 md:mt-11">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="testimonials-heading"
            className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            What our customers say
          </h2>
          <p className="mt-2 text-sm text-muted">
            Real feedback from buyers who trusted our team—smooth handovers and
            clear communication every step.
          </p>
        </div>

        <div className="relative -mx-4 mt-8 sm:-mx-6 sm:mt-9 md:mx-0 md:mt-10">
          {/* Edge fades — mobile carousel only */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-6 bg-gradient-to-r from-background from-50% to-transparent md:hidden"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-background from-40% to-transparent md:hidden"
            aria-hidden
          />

          <ul
            role="list"
            aria-label="Customer testimonials, scroll sideways on small screens"
            className="flex snap-x snap-mandatory flex-nowrap gap-3 overflow-x-auto overflow-y-hidden scroll-smooth scroll-pl-6 scroll-pr-6 pb-1 pl-6 pr-6 [-ms-overflow-style:none] [scrollbar-width:none] sm:scroll-pl-8 sm:scroll-pr-8 sm:pl-8 sm:pr-8 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:scroll-p-0 md:pl-0 md:pr-0 md:pb-0 xl:grid-cols-5 xl:gap-3 [&::-webkit-scrollbar]:hidden"
          >
            {ITEMS.map((t) => (
              <li key={t.name} className="md:h-full">
                <figure className={cardClassName}>
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="flex gap-0.5"
                      aria-label="5 out of 5 stars"
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={`${t.name}-${i}`}
                          className="h-3.5 w-3.5 fill-brand/90 text-brand"
                          aria-hidden
                        />
                      ))}
                    </div>
                    <Quote
                      className="h-4 w-4 shrink-0 text-brand/25 transition-colors group-hover:text-brand/40"
                      aria-hidden
                    />
                  </div>
                  <blockquote className="mt-3 min-h-0 flex-1">
                    <p className="line-clamp-6 text-[13px] leading-relaxed text-foreground/95 md:line-clamp-none">
                      “{t.quote}”
                    </p>
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-2.5 border-t border-border/70 pt-3.5">
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface shadow-inner ring-2 ring-black/[0.04] dark:ring-white/[0.08]">
                      <Image
                        src={t.photo}
                        alt={`Photo of ${t.name}`}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {t.name}
                      </p>
                      {t.subtitle ? (
                        <p className="truncate text-xs text-muted">
                          {t.subtitle}
                        </p>
                      ) : null}
                    </div>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-muted md:hidden">
          <ChevronsLeftRight
            className="h-3.5 w-3.5 shrink-0 text-brand/70"
            aria-hidden
          />
          <span>Swipe for more stories</span>
        </p>

        <div
          className="mt-3 flex justify-center gap-1.5 md:hidden"
          aria-hidden
        >
          {ITEMS.map((t) => (
            <span
              key={t.name}
              className="h-1 w-1 rounded-full bg-border shadow-sm ring-1 ring-black/[0.04] dark:ring-white/10"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
