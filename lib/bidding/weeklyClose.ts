import { DateTime } from "luxon";

const TZ = "Asia/Manila";

/**
 * Weekly rhythm (Luxon weekday: Mon=1 … Sun=7): bidding is open Saturday–Wednesday,
 * with Wednesday ending at 16:00. Closed Thursday–Friday and from Wednesday 16:00 onward.
 */
export function isWeeklyBiddingOpen(now: Date = new Date()): boolean {
  const dt = DateTime.fromJSDate(now).setZone(TZ);
  const weekday = dt.weekday;
  if (weekday === 4 || weekday === 5) return false;
  if (weekday === 3) {
    const minutes = dt.hour * 60 + dt.minute;
    return minutes < 16 * 60;
  }
  return true;
}

/** Next Wednesday 16:00 Manila at or strictly after `from` (same week if still before that instant). */
export function getNextWednesdayDeadline(from: Date = new Date()): Date {
  const dt = DateTime.fromJSDate(from).setZone(TZ);
  const daysUntilWed = (3 - dt.weekday + 7) % 7;
  let wed = dt
    .plus({ days: daysUntilWed })
    .set({ hour: 16, minute: 0, second: 0, millisecond: 0 });
  if (wed < dt) {
    wed = wed.plus({ weeks: 1 });
  }
  return wed.toJSDate();
}
