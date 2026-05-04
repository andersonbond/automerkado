/** Single storefront / office listing for maps and contact. */

export const OFFICE_COORDINATES = {
  lat: 10.3014447,
  lng: 123.9474928,
} as const;

/** Full street address (display + map search). */
export const OFFICE_ADDRESS =
  "A. Tumulak St, Lapu-Lapu, 6015 Cebu" as const;

/** Human-readable phone; use `OFFICE_PHONE_TEL` for `tel:` links. */
export const OFFICE_PHONE_DISPLAY = "+63 956 5010 170" as const;

export const OFFICE_PHONE_TEL = "+639565010170" as const;

/**
 * Opens in Google Maps at the pinned coordinates / address query.
 */
export function officeGoogleMapsSearchUrl(): string {
  const q = encodeURIComponent(
    `${OFFICE_ADDRESS} @${OFFICE_COORDINATES.lat},${OFFICE_COORDINATES.lng}`,
  );
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/**
 * Google Maps embed for the office pin (no API key; same-origin iframe).
 */
export function officeMapEmbedSrc(): string {
  const lat = OFFICE_COORDINATES.lat;
  const lng = OFFICE_COORDINATES.lng;
  return `https://maps.google.com/maps?q=${lat}%2C${lng}&hl=en&t=m&z=17&ie=UTF8&iwloc=B&output=embed`;
}
