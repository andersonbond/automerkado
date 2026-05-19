/** Fuel options on admin car forms (stored exactly as shown). */
export const CAR_FUEL_TYPES = ["Gas", "Diesel", "Hybrid", "Electric"] as const;

export type CarFuelType = (typeof CAR_FUEL_TYPES)[number];

const SET = new Set<string>(CAR_FUEL_TYPES);

export function isCarFuelType(value: string): value is CarFuelType {
  return SET.has(value);
}

/** Parse `fuelType` query param; returns undefined if missing or invalid. */
export function parseFuelTypeQuery(
  raw: string | undefined,
): CarFuelType | undefined {
  if (!raw) return undefined;
  return isCarFuelType(raw) ? raw : undefined;
}
