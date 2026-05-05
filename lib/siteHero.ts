import { prisma } from "@/lib/db";

/** Bundled asset when no custom hero is configured. */
export const DEFAULT_HERO_BACKGROUND = "/bg_image.JPEG";

function clampPct(n: number): number {
  const v = Math.round(Number.isFinite(n) ? n : 50);
  return Math.min(100, Math.max(0, v));
}

/** Uploaded hero video extensions (stored under `/uploads/site/hero-bg.*`). */
export function isHeroVideoSrc(src: string): boolean {
  const pathOnly = src.split("?")[0]?.toLowerCase() ?? "";
  return /\.(mp4|webm|mov)$/i.test(pathOnly);
}

export type HeroVisualConfig = {
  src: string;
  focusX: number;
  focusY: number;
  /** CSS object-position value, e.g. `50% 42%`. */
  objectPositionPct: string;
  usesCustomUpload: boolean;
  /** True when custom hero is a video file (not the default static photo). */
  isVideo: boolean;
};

/** Single-row read for the home hero (`SiteSettings`). */
export async function getHeroVisualConfig(): Promise<HeroVisualConfig> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  const usesCustomUpload = Boolean(row?.heroBackgroundPath);
  const src = row?.heroBackgroundPath ?? DEFAULT_HERO_BACKGROUND;
  const focusX = clampPct(row?.heroFocusX ?? 50);
  const focusY = clampPct(row?.heroFocusY ?? 42);
  const isVideo = Boolean(row?.heroBackgroundPath && isHeroVideoSrc(src));

  return {
    src,
    focusX,
    focusY,
    objectPositionPct: `${focusX}% ${focusY}%`,
    usesCustomUpload,
    isVideo,
  };
}
