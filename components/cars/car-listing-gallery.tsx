"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

export type CarGalleryImage = {
  id: string;
  path: string;
  alt: string | null;
};

const heroSizes =
  "(max-width: 768px) 100vw, (max-width: 1024px) 65vw, min(720px, 55vw)";
const thumbSizes = "112px";

export function CarListingGallery({
  images,
  fallbackAlt,
}: {
  images: CarGalleryImage[];
  fallbackAlt: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const titleId = useId();
  const list = images.length > 0 ? images : [];
  const primary = list[0];
  const rest = list.slice(1);

  const openAt = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const n = list.length;
    if (n === 0) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setLightboxIndex((i) => (i === null ? null : (i + 1) % n));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setLightboxIndex((i) =>
          i === null ? null : (i - 1 + n) % n,
        );
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, list.length]);

  if (!primary) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <Image
          src="/car_images/IMG_01.webp"
          alt={fallbackAlt}
          fill
          className="object-cover"
          sizes={heroSizes}
          priority
        />
      </div>
    );
  }

  const altFor = (im: CarGalleryImage) => im.alt ?? fallbackAlt;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => openAt(0)}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-card outline-none ring-offset-2 ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-brand/40"
        aria-label={`View larger featured photo — ${altFor(primary)}`}
      >
        <Image
          src={primary.path}
          alt={altFor(primary)}
          fill
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] group-focus-visible:scale-[1.02]"
          sizes={heroSizes}
          priority
        />
        {list.length > 1 ? (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            +{rest.length} more · tap to expand
          </span>
        ) : (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            Tap to enlarge
          </span>
        )}
      </button>

      {rest.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            More photos
          </p>
          <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-1 pb-2 pt-0.5 [scrollbar-width:thin]">
            {rest.map((im, j) => {
              const idx = j + 1;
              return (
                <button
                  key={im.id}
                  type="button"
                  onClick={() => openAt(idx)}
                  className="relative h-[4.5rem] w-[6.75rem] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-surface shadow-sm outline-none ring-offset-2 ring-offset-background transition hover:border-brand/35 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand/40 sm:h-[5rem] sm:w-[7.5rem]"
                  aria-label={`View larger — ${altFor(im)}`}
                >
                  <Image
                    src={im.path}
                    alt={altFor(im)}
                    fill
                    className="object-cover"
                    sizes={thumbSizes}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {lightboxIndex !== null && list[lightboxIndex] ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/82 backdrop-blur-[2px]"
            aria-label="Close gallery"
            onClick={closeLightbox}
          />

          <div className="relative z-10 flex max-h-[min(90vh,920px)] w-full max-w-5xl flex-col items-center">
            <div className="flex w-full items-center justify-between gap-3 pb-3 text-white">
              <p id={titleId} className="truncate text-sm font-medium sm:text-base">
                {altFor(list[lightboxIndex])}
              </p>
              <button
                type="button"
                onClick={closeLightbox}
                className="inline-flex shrink-0 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="relative flex min-h-0 w-full flex-1 items-center justify-center gap-2">
              {list.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + list.length) % list.length,
                    )
                  }
                  className="absolute left-2 top-1/2 z-20 inline-flex -translate-y-1/2 rounded-full bg-white/12 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/22 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white sm:static sm:top-auto sm:translate-y-0 sm:bg-white/10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
                </button>
              ) : null}

              <div className="relative min-h-[40vh] w-full min-w-0 flex-1 max-h-[min(78vh,820px)] overflow-hidden rounded-xl bg-black/40 shadow-2xl sm:min-h-[min(60vh,560px)]">
                <Image
                  src={list[lightboxIndex].path}
                  alt={altFor(list[lightboxIndex])}
                  fill
                  className="object-contain"
                  sizes="95vw"
                  priority
                />
              </div>

              {list.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % list.length)
                  }
                  className="absolute right-2 top-1/2 z-20 inline-flex -translate-y-1/2 rounded-full bg-white/12 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/22 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white sm:static sm:top-auto sm:translate-y-0 sm:bg-white/10"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
                </button>
              ) : null}
            </div>

            {list.length > 1 ? (
              <p className="pt-3 text-center text-xs text-white/75">
                {lightboxIndex + 1} / {list.length} · Use arrow keys to browse
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
