import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { OfficeMapEmbed } from "@/components/site/office-map-embed";
import {
  OFFICE_ADDRESS,
  OFFICE_PHONE_DISPLAY,
  OFFICE_PHONE_TEL,
  officeGoogleMapsSearchUrl,
} from "@/lib/office";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Automerkado in Lapu-Lapu, Cebu—phone, directions, maps, plus email for bidding support, inspections, and dealer partnerships.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    title: "Contact | Automerkado",
    description:
      "Call us, email us, or get directions to our Cebu office—bids, inspections, partnerships.",
    url: absoluteUrl("/contact"),
    type: "website",
  },
};

export default function ContactPage() {
  const mapsHref = officeGoogleMapsSearchUrl();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Get in touch
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Contact
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        We reply during business hours. For fastest help with bids or inspections,
        include the listing slug or vehicle title.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start lg:gap-10 xl:gap-12">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-7">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Office
            </h2>
            <p className="mt-4 flex gap-3 text-base leading-relaxed text-foreground">
              <MapPin
                className="mt-0.5 h-5 w-5 shrink-0 text-brand"
                strokeWidth={2}
                aria-hidden
              />
              <span>{OFFICE_ADDRESS}</span>
            </p>
            <p className="mt-6 flex gap-3 text-base leading-relaxed text-foreground">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
              <a
                href={`tel:${OFFICE_PHONE_TEL}`}
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                {OFFICE_PHONE_DISPLAY}
              </a>
            </p>
            <p className="mt-8 border-t border-border pt-8 text-sm leading-relaxed text-muted">
              Email:{" "}
              <a
                href="mailto:support@automerkado.local"
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                support@automerkado.local
              </a>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Dealer partnerships: include your company name and location for a faster reply.
            </p>
          </div>

          <Link
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-surface lg:w-auto"
          >
            Get directions — Google Maps
            <span className="ml-1 text-xs opacity-75" aria-hidden>
              ↗
            </span>
          </Link>
        </div>

        <div>
          <h2 className="sr-only">Map</h2>
          <OfficeMapEmbed
            title="Automerkado office location on Google Maps"
            containerClassName="relative isolate aspect-[4/3] min-h-[280px] w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-card ring-1 ring-black/[0.04] lg:aspect-auto lg:min-h-[340px]"
          />
          <p className="mt-3 text-xs text-muted">
            Map shows our office pinned at the address above. Prefer the app?
            Use &ldquo;Open in Google Maps&rdquo; for turn-by-turn navigation.
          </p>
        </div>
      </div>
    </div>
  );
}
