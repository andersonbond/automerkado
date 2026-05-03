/** Popular brands for hero chips and listing filters (exact match to `Car.brand`). */
export const POPULAR_CAR_BRANDS = [
  "Toyota",
  "Mitsubishi",
  "Suzuki",
  "Ford",
  "Nissan",
  "Isuzu",
] as const;

export type PopularCarBrand = (typeof POPULAR_CAR_BRANDS)[number];
