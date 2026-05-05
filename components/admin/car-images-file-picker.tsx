"use client";

import { ImagePlus, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const labelClass =
  "flex cursor-pointer flex-col rounded-xl border-2 border-dashed border-surface/90 bg-surface/25 px-5 py-8 text-center transition hover:border-brand/40 hover:bg-brand/[0.03]";

export function CarImagesFilePicker() {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const urlsRef = useRef<string[]>([]);

  const revokeAll = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  }, []);

  useEffect(() => () => revokeAll(), [revokeAll]);

  useEffect(() => {
    if (previewUrls.length === 0) {
      setFeaturedIndex(0);
      return;
    }
    setFeaturedIndex((prev) => Math.min(prev, previewUrls.length - 1));
  }, [previewUrls.length]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    revokeAll();
    const files = e.target.files;
    if (!files?.length) {
      setPreviewUrls([]);
      return;
    }
    const next: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i]);
      urlsRef.current.push(url);
      next.push(url);
    }
    setPreviewUrls(next);
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
          JPEG, PNG, or WebP · multiple files OK
        </span>
        <input
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onChange}
          className="mt-5 block w-full text-xs text-muted file:mx-auto file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-brand-foreground file:shadow-sm hover:file:opacity-95"
        />
      </label>

      {previewUrls.length > 0 ? (
        <fieldset className="rounded-xl border border-surface/80 bg-surface/20 p-4">
          <legend className="px-0.5 text-xs font-semibold uppercase tracking-wider text-muted">
            Featured photo
          </legend>
          <p className="mb-3 text-xs text-muted">
            This image appears first on the listing, on cards, and in search results.
          </p>
          <p className="mb-3 text-xs font-medium text-foreground">
            Preview — {previewUrls.length}{" "}
            {previewUrls.length === 1 ? "image" : "images"} selected
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {previewUrls.map((url, i) => (
              <li key={url}>
                <label className="block cursor-pointer">
                  <span
                    className={`relative block overflow-hidden rounded-xl border-2 bg-card shadow-sm transition hover:border-brand/35 ${
                      featuredIndex === i
                        ? "border-brand ring-2 ring-brand/25"
                        : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob URLs */}
                    <img src={url} alt="" className="aspect-square w-full object-cover" />
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
