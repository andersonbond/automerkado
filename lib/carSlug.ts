import type { PrismaClient } from "@prisma/client";

/** Derives a URL-safe slug from listing title (matches car slug regex). */
export function slugFromTitle(title: string): string {
  const s = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  return s || "listing";
}

/** Picks the first unused slug: `base`, then `base-2`, `base-3`, … */
export async function allocateUniqueCarSlug(
  db: PrismaClient,
  base: string,
): Promise<string> {
  let normalized = base
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
  if (!normalized) normalized = "listing";

  let candidate = normalized;
  let n = 1;
  while (await db.car.findUnique({ where: { slug: candidate } })) {
    const suffix = `-${n}`;
    n += 1;
    candidate = `${normalized.slice(0, Math.max(1, 200 - suffix.length))}${suffix}`;
  }
  return candidate;
}
