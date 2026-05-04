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
 * Repossessed + Active listings expire at Wednesday 16:30 Asia/Manila in the **same**
 * Monday-start week as `createdAt`, unless that cutoff has already passed — then the
 * following Wednesday 16:30.
 *
 * Example: listed Monday → visibility ends that week's Wednesday after 4:30 PM.
 */
export function getRepossessedListingExpiresAt(createdAt: Date): Date {
  const dt = DateTime.fromJSDate(createdAt).setZone(TZ);
  const monday = startOfMondayWeek(dt);
  let wedCutoff = monday.plus({ days: 2 }).set({
    hour: CUT_HOUR,
    minute: CUT_MINUTE,
    second: 0,
    millisecond: 0,
  });
  if (dt > wedCutoff) {
    wedCutoff = wedCutoff.plus({ weeks: 1 });
  }
  return wedCutoff.toJSDate();
}

/** ISO timestamp for client countdowns; null when not a repossessed listing window. */
export function getRepossessedListingExpiresAtIso(
  categorySlug: string,
  createdAt: Date,
): string | null {
  if (categorySlug !== REPOSSESSED_CATEGORY_SLUG) return null;
  return getRepossessedListingExpiresAt(createdAt).toISOString();
}
