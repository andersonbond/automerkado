import { absoluteUrl } from "@/lib/site";
import { prisma } from "@/lib/db";

/** Default raster logo used when no custom logo is set (header/OG). */
export const DEFAULT_SITE_LOGO = "/logo.jpeg";

/** Default vector favicon in `public/`. */
export const DEFAULT_FAVICON = "/logo.svg";

export async function getSiteLogoSrc(): Promise<string> {
  const row = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  if (row?.logoPath) return row.logoPath;
  return DEFAULT_SITE_LOGO;
}

export async function getAbsoluteSiteLogoUrl(): Promise<string> {
  return absoluteUrl(await getSiteLogoSrc());
}
