/** Canonical body type values (admin listings + public filters). */
export const CAR_BODY_TYPES = [
  "Hatchback",
  "Sedan",
  "SUV",
  "Van",
  "Luxury Sedan",
  "Luxury SUV",
  "Pick-up",
] as const;

export type CarBodyType = (typeof CAR_BODY_TYPES)[number];

const SET = new Set<string>(CAR_BODY_TYPES);

export function isCarBodyType(value: string): value is CarBodyType {
  return SET.has(value);
}

/** Parse `bodyType` query param; returns undefined if missing or invalid. */
export function parseBodyTypeQuery(
  raw: string | undefined,
): CarBodyType | undefined {
  if (!raw) return undefined;
  return isCarBodyType(raw) ? raw : undefined;
}
