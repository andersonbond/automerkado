import { DateTime } from "luxon";

export const REPOSSESSED_CATEGORY_SLUG = "repossessed";

const TZ = "Asia/Manila";

/** Wednesday cuts at 16:30 Manila (repossessed visibility window). */
const CUT_HOUR = 16;
const CUT_MINUTE = 30;

/** Monday 00:00 of the ISO-style week that contains `dt` (Luxon: weekday 1 = Monday). */
function startOfMondayWeek(dt: DateTime): DateTime {
  return dt.startOf("day").minus({ days: dt.weekday - 1 });
}

/**
 * Repossessed + Active listings expire on Wednesday 16:30 Manila of the **calendar week after**
 * the week that contains `createdAt` (Monday-start weeks).
 *
 * Example: listed Friday → inactive the following week's Wednesday after 4:30 PM (that Wednesday instant).
 */
export function getRepossessedListingExpiresAt(createdAt: Date): Date {
  const dt = DateTime.fromJSDate(createdAt).setZone(TZ);
  const monday = startOfMondayWeek(dt);
  const nextWednesday = monday
    .plus({ weeks: 1 })
    .plus({ days: 2 })
    .set({
      hour: CUT_HOUR,
      minute: CUT_MINUTE,
      second: 0,
      millisecond: 0,
    });
  return nextWednesday.toJSDate();
}

/** ISO timestamp for client countdowns; null when not a repossessed listing window. */
export function getRepossessedListingExpiresAtIso(
  categorySlug: string,
  createdAt: Date,
): string | null {
  if (categorySlug !== REPOSSESSED_CATEGORY_SLUG) return null;
  return getRepossessedListingExpiresAt(createdAt).toISOString();
}
