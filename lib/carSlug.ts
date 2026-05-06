import { randomBytes } from "crypto";
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

/**
 * Returns an unused car slug. First tries `base` itself; on conflict, appends a
 * short random hex suffix (e.g. `my-car-a3f9`) and retries until one is free.
 * Hex (4 → 6 → 8 chars) keeps the slug compact while making collisions on
 * generic titles like "listing" practically impossible.
 */
export async function allocateUniqueCarSlug(
  db: PrismaClient,
  base: string,
): Promise<string> {
  let normalized = base
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
  if (!normalized) normalized = "listing";

  if (!(await db.car.findUnique({ where: { slug: normalized } }))) {
    return normalized;
  }

  for (const hexLen of [4, 6, 8] as const) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const suffix = `-${randomBytes(hexLen).toString("hex").slice(0, hexLen)}`;
      const candidate = `${normalized.slice(0, Math.max(1, 200 - suffix.length))}${suffix}`;
      if (!(await db.car.findUnique({ where: { slug: candidate } }))) {
        return candidate;
      }
    }
  }

  // Astronomically unlikely fallback: pad with a longer random suffix.
  const suffix = `-${randomBytes(12).toString("hex")}`;
  return `${normalized.slice(0, Math.max(1, 200 - suffix.length))}${suffix}`;
}
