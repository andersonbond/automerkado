"use client";

import { ImagePlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const labelClass =
  "flex cursor-pointer flex-col rounded-xl border-2 border-dashed border-surface/90 bg-surface/25 px-5 py-8 text-center transition hover:border-brand/40 hover:bg-brand/[0.03]";

export function CarImagesFilePicker() {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const urlsRef = useRef<string[]>([]);

  const revokeAll = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  }, []);

  useEffect(() => () => revokeAll(), [revokeAll]);

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
        <div className="rounded-xl border border-surface/80 bg-surface/20 p-4">
          <p className="mb-3 text-xs font-medium text-muted">
            Preview — {previewUrls.length}{" "}
            {previewUrls.length === 1 ? "image" : "images"} selected
          </p>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {previewUrls.map((url) => (
              <li
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg border border-surface/90 bg-card shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- blob URLs */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
