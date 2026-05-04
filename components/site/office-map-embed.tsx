import { officeMapEmbedSrc } from "@/lib/office";

type OfficeMapEmbedProps = {
  /** Accessible name for the frame (shown to assistive tech). */
  title: string;
  /** Extra classes on the iframe. */
  className?: string;
  /** Overrides default aspect-ratio wrapper. */
  containerClassName?: string;
};

/**
 * Responsive Google Maps iframe pinned to Automerkado office coordinates (`lib/office.ts`).
 */
export function OfficeMapEmbed({
  title,
  className,
  containerClassName,
}: OfficeMapEmbedProps) {
  return (
    <div
      className={
        containerClassName ??
        "relative isolate aspect-[16/10] max-h-[min(52vh,440px)] min-h-[220px] w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-card ring-1 ring-black/[0.04]"
      }
    >
      <iframe
        title={title}
        src={officeMapEmbedSrc()}
        className={
          className ??
          "absolute inset-0 h-full w-full border-0 [color-scheme:light]"
        }
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
