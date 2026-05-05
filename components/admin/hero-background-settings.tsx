"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { HeroBackdropMedia } from "@/components/landing/hero-backdrop-media";
import {
  clearHeroBackgroundAction,
  saveHeroFocusAction,
  updateHeroBackgroundAction,
} from "@/lib/actions/heroBackground";

export function HeroBackgroundAdminPanel(props: {
  previewSrc: string;
  initialFocusX: number;
  initialFocusY: number;
  usesCustomUpload: boolean;
  isVideo: boolean;
}) {
  const [focusX, setFocusX] = useState(props.initialFocusX);
  const [focusY, setFocusY] = useState(props.initialFocusY);

  useEffect(() => {
    setFocusX(props.initialFocusX);
    setFocusY(props.initialFocusY);
  }, [props.initialFocusX, props.initialFocusY]);

  const objectPos = `${focusX}% ${focusY}%`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 gap-y-1">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Hero background</h3>
          <p className="mt-0.5 text-xs text-muted">
            Image or short looping video — focal point maps to{" "}
            <code className="rounded bg-surface px-0.5 text-[11px]">object-position</code> (video included).
          </p>
        </div>
        {props.isVideo ? (
          <span className="rounded-full border border-border bg-surface/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Video (muted loop)
          </span>
        ) : null}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Preview</p>
        <div className="relative mt-2 max-h-44 aspect-[21/10] overflow-hidden rounded-xl border border-border bg-neutral-950 shadow-inner ring-1 ring-black/5 sm:max-h-52">
          <HeroBackdropMedia
            src={props.previewSrc}
            objectPosition={objectPos}
            isVideo={props.isVideo}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0c0e14]/50 via-transparent to-[#0c0e14]/35"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 bg-white/15 shadow backdrop-blur-[2px]"
            style={{ left: `${focusX}%`, top: `${focusY}%` }}
          >
            <span className="h-1 w-1 rounded-full bg-brand ring-2 ring-white/95" />
          </span>
        </div>
        <p className="mt-1 text-center text-[10px] leading-tight text-muted">
          Marker = focal anchor on cropped frame
        </p>
      </div>

      <form action={saveHeroFocusAction} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-foreground">
            Horizontal
            <span className="ml-1.5 tabular-nums text-muted">{focusX}%</span>
            <input
              type="range"
              name="heroFocusX"
              min={0}
              max={100}
              value={focusX}
              onChange={(e) => setFocusX(Number(e.target.value))}
              className="mt-1.5 w-full accent-brand"
            />
          </label>
          <label className="block text-xs font-medium text-foreground">
            Vertical
            <span className="ml-1.5 tabular-nums text-muted">{focusY}%</span>
            <input
              type="range"
              name="heroFocusY"
              min={0}
              max={100}
              value={focusY}
              onChange={(e) => setFocusY(Number(e.target.value))}
              className="mt-1.5 w-full accent-brand"
            />
          </label>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground shadow-sm hover:opacity-95"
        >
          Save focal position
        </button>
      </form>

      <div className="flex flex-col gap-2 rounded-lg border border-border/90 bg-surface/20 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <form action={updateHeroBackgroundAction} encType="multipart/form-data" className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label className="min-w-0 flex-1 text-xs font-medium text-foreground">
            Replace · image ≤10&nbsp;MB, video loop ≤45&nbsp;MB —{" "}
            <span className="font-semibold text-foreground">MP4, WebM, MOV</span> or JPEG/PNG/WebP
            <input
              name="heroBackground"
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.jpg,.jpeg,.png,.webp"
              required
              className="mt-1.5 block w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-surface file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
            />
          </label>
          <button
            type="submit"
            className="h-9 shrink-0 whitespace-nowrap rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-sm hover:border-brand/30"
          >
            Upload
          </button>
        </form>
        {props.usesCustomUpload ? (
          <form action={clearHeroBackgroundAction} className="shrink-0">
            <button
              type="submit"
              className="text-xs font-semibold text-muted underline decoration-border underline-offset-2 hover:text-foreground"
            >
              Restore default
            </button>
          </form>
        ) : (
          <p className="shrink-0 text-[11px] text-muted">Bundled default in use.</p>
        )}
      </div>

      <details className="group rounded-lg border border-dashed border-border/90 bg-surface/20">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-medium marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="text-muted group-open:text-foreground">Recommended image & video specs</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
        </summary>
        <ul className="space-y-1.5 border-t border-border/60 px-3 py-2.5 text-xs leading-snug text-muted">
          <li>
            <strong className="font-medium text-foreground">Still image:</strong> ≥{" "}
            <strong className="text-foreground">2400×1200 px</strong> ideal; min{" "}
            <strong className="text-foreground">1920×1080</strong>. JPEG ~75–85 or WebP.
          </li>
          <li>
            <strong className="font-medium text-foreground">Video loop:</strong>{" "}
            <strong className="text-foreground">5–20 s</strong> seamless loop,{" "}
            <strong className="text-foreground">1080p</strong> or 1440p wide, H.264 MP4 (best compatibility) or
            WebM. Export <strong className="text-foreground">without audio</strong> (we mute on the site; silent
            files are smaller). Keep under <strong className="text-foreground">45 MB</strong>.
          </li>
          <li>
            Autoplay on mobile requires muted + inline playback — we set that automatically. Prefer darker footage
            so hero text stays legible over scrims.
          </li>
        </ul>
      </details>
    </div>
  );
}
