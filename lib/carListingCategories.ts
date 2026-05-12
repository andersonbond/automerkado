import { REPOSSESSED_CATEGORY_SLUG } from "@/lib/repossessedListing";

/** Category slug for certified listings (seed). */
export const CERTIFIED_CATEGORY_SLUG = "certified";

export { REPOSSESSED_CATEGORY_SLUG } from "@/lib/repossessedListing";

/** Listed cars shown on the public storefront (hero search + `/listings/all`). */
export const PUBLIC_LISTING_CATEGORY_SLUGS = [
  CERTIFIED_CATEGORY_SLUG,
  REPOSSESSED_CATEGORY_SLUG,
] as const;
