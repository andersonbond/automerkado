/**
 * Preset values for public listing filter chips (`?bodyType=`).
 * Admin body type is free text; filter URL still accepts only these exact values.
 */
export const CAR_BODY_TYPES = [
  "Hatchback",
  "Sedan",
  "SUV",
  "Van",
  "Pick-up",
  "Big Bikes",
  "Motorcycles",
  "Convertible",
  "Coupe",
  "Crossover",
  "Station Wagon",
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
