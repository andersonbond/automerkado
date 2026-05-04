import { Car } from "lucide-react";

/** Shown when a listing has no uploaded photos (instead of a stock image). */
export function ListingPhotoPlaceholder({
  className = "",
  iconClassName = "h-14 w-14 opacity-30",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-surface via-surface to-surface/70 text-muted ${className}`}
      role="img"
      aria-label="No photo yet"
    >
      <Car className={iconClassName} aria-hidden />
    </div>
  );
}
