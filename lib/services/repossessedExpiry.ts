import { prisma } from "@/lib/db";
import {
  getRepossessedListingExpiresAt,
  REPOSSESSED_CATEGORY_SLUG,
} from "@/lib/repossessedListing";

/**
 * Marks expired repossessed LISTED cars as INACTIVE so they drop off public listings.
 * Expiry follows {@link getRepossessedListingExpiresAt} (Wednesday 16:30 Manila in-listing-week, or next week if past cutoff).
 * Safe to call frequently (idempotent).
 */
export async function deactivateExpiredRepossessedListings(now = new Date()) {
  const candidates = await prisma.car.findMany({
    where: {
      status: "LISTED",
      category: { slug: REPOSSESSED_CATEGORY_SLUG },
    },
    select: { id: true, createdAt: true, repossessedManualRelistAt: true },
  });

  const expiredIds = candidates
    .filter(
      (c) =>
        now >= getRepossessedListingExpiresAt(c.createdAt, c.repossessedManualRelistAt),
    )
    .map((c) => c.id);

  if (expiredIds.length === 0) return;

  await prisma.car.updateMany({
    where: { id: { in: expiredIds } },
    data: { status: "INACTIVE", updatedAt: new Date() },
  });
}
