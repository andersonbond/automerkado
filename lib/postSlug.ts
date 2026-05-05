import type { PrismaClient } from "@prisma/client";

/** URL-safe slug from post title (same rules as listing slugs). */
export function postSlugFromTitle(title: string): string {
  const s = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  return s || "post";
}

/** First unused slug: `base`, then `base-2`, `base-3`, … */
export async function allocateUniquePostSlug(
  db: PrismaClient,
  base: string,
  excludePostId?: string,
): Promise<string> {
  let normalized = base
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
  if (!normalized) normalized = "post";

  let candidate = normalized;
  for (let n = 1; n < 10_000; n++) {
    const existing = await db.post.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === excludePostId) return candidate;
    const suffix = `-${n}`;
    candidate = `${normalized.slice(0, Math.max(1, 200 - suffix.length))}${suffix}`;
  }
  return `${normalized}-fallback`;
}
