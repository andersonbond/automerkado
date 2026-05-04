import Link from "next/link";
import { MapPin } from "lucide-react";
import { OfficeMapEmbed } from "@/components/site/office-map-embed";
import { OFFICE_ADDRESS, officeGoogleMapsSearchUrl } from "@/lib/office";

export function OfficeLocationSection() {
  const mapsHref = officeGoogleMapsSearchUrl();

  return (
    <section
      className=" bg-surface/[0.35] py-12 sm:py-14 md:py-16"
      aria-labelledby="office-location-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Visit us
            </p>
            <h2
              id="office-location-heading"
              className="mt-2 flex items-start gap-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              <MapPin
                className="mt-1 h-7 w-7 shrink-0 text-brand sm:h-8 sm:w-8"
                strokeWidth={2}
                aria-hidden
              />
              <span>Lapu-Lapu City, Cebu</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              {OFFICE_ADDRESS}. Stop by during business hours or open directions in
              Google Maps.
            </p>
          </div>
          <Link
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            Open in Google Maps
            <span className="text-xs opacity-75" aria-hidden>
              ↗
            </span>
          </Link>
        </div>

        <div className="mt-8 sm:mt-10">
          <OfficeMapEmbed title="Automerkado office location map" />
        </div>
      </div>
    </section>
  );
}
