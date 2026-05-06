"use client";

import { ImagePlus, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const labelClass =
  "flex cursor-pointer flex-col rounded-xl border-2 border-dashed border-surface/90 bg-surface/25 px-5 py-8 text-center transition hover:border-brand/40 hover:bg-brand/[0.03]";

/**
 * Hard ceiling for the initial create-car upload. The server has no matching
 * cap (per product decision), so we rely on this client-side guard to keep the
 * total payload comfortably under the 120 MB body limit.
 */
const MAX_IMAGES_PER_LISTING = 20;

type Preview = {
  url: string;
  name: string;
  /** True when the browser likely can't render this file in <img>. */
  isHeic: boolean;
};

function detectHeic(file: File): boolean {
  if (file.type === "image/heic" || file.type === "image/heif") return true;
  return /\.(heic|heif)$/i.test(file.name);
}

export function CarImagesFilePicker() {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const urlsRef = useRef<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const revokeAll = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  }, []);

  useEffect(() => () => revokeAll(), [revokeAll]);

  useEffect(() => {
    if (previews.length === 0) {
      setFeaturedIndex(0);
      return;
    }
    setFeaturedIndex((prev) => Math.min(prev, previews.length - 1));
  }, [previews.length]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    revokeAll();
    setError(null);
    const files = e.target.files;
    if (!files?.length) {
      setPreviews([]);
      return;
    }
    if (files.length > MAX_IMAGES_PER_LISTING) {
      setError(
        `You picked ${files.length} images. Maximum is ${MAX_IMAGES_PER_LISTING} per listing — please choose ${MAX_IMAGES_PER_LISTING} or fewer.`,
      );
      if (inputRef.current) inputRef.current.value = "";
      setPreviews([]);
      return;
    }
    const next: Preview[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i]!;
      const url = URL.createObjectURL(f);
      urlsRef.current.push(url);
      next.push({ url, name: f.name, isHeic: detectHeic(f) });
    }
    setPreviews(next);
    setFeaturedIndex(0);
  }

  return (
    <div className="space-y-4">
      <label className={labelClass}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-card text-brand shadow-sm ring-1 ring-surface/80">
          <ImagePlus className="h-5 w-5" aria-hidden />
        </span>
        <span className="mt-3 text-sm font-medium text-foreground">
          Upload images
        </span>
        <span className="mt-1 text-xs text-muted">
          JPEG, PNG, WebP, or HEIC · up to {MAX_IMAGES_PER_LISTING} photos · iPhone HEIC photos auto-convert to JPEG
        </span>
        <input
          ref={inputRef}
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          multiple
          onChange={onChange}
          className="mt-5 block w-full text-xs text-muted file:mx-auto file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-brand-foreground file:shadow-sm hover:file:opacity-95"
        />
      </label>

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-xs font-medium text-red-900"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {previews.length > 0 ? (
        <fieldset className="rounded-xl border border-surface/80 bg-surface/20 p-4">
          <legend className="px-0.5 text-xs font-semibold uppercase tracking-wider text-muted">
            Featured photo
          </legend>
          <p className="mb-3 text-xs text-muted">
            This image appears first on the listing, on cards, and in search results.
          </p>
          <p className="mb-3 text-xs font-medium text-foreground">
            Preview — {previews.length}{" "}
            {previews.length === 1 ? "image" : "images"} selected
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {previews.map((p, i) => (
              <li key={p.url}>
                <label className="block cursor-pointer">
                  <span
                    className={`relative block overflow-hidden rounded-xl border-2 bg-card shadow-sm transition hover:border-brand/35 ${
                      featuredIndex === i
                        ? "border-brand ring-2 ring-brand/25"
                        : "border-transparent"
                    }`}
                  >
                    {p.isHeic ? (
                      <span className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-brand/10 via-surface/40 to-surface/20 px-2 text-center">
                        <span className="rounded-md bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                          HEIC
                        </span>
                        <span className="text-[10px] font-medium text-muted">
                          Will convert to JPG
                        </span>
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element -- blob URLs
                      <img src={p.url} alt="" className="aspect-square w-full object-cover" />
                    )}
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                      <Star
                        className={`h-3 w-3 ${featuredIndex === i ? "fill-amber-300 text-amber-200" : "text-white/90"}`}
                        aria-hidden
                      />
                      Featured
                    </span>
                    <input
                      type="radio"
                      name="featuredImageIndex"
                      value={i}
                      checked={featuredIndex === i}
                      onChange={() => setFeaturedIndex(i)}
                      className="sr-only"
                    />
                  </span>
                  <span
                    className={`mt-1.5 block text-center text-[11px] font-medium ${
                      featuredIndex === i ? "text-brand" : "text-muted"
                    }`}
                  >
                    {featuredIndex === i ? "Featured" : `Photo ${i + 1}`}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}
    </div>
  );
}
