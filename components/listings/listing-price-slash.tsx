import type { Prisma } from "@prisma/client";

function fmtPhpPlain(n: number) {
  return `PHP ${n.toLocaleString("en-PH")}`;
}

/**
 * Public listing price: original (list) struck through, slash, then sale price.
 */
export function ListingPriceSlashPair({
  listPrice,
  salePrice,
  className,
}: {
  listPrice: Prisma.Decimal;
  salePrice: Prisma.Decimal;
  className?: string;
}) {
  const list = listPrice.toNumber();
  const sale = salePrice.toNumber();
  return (
    <span className={className}>
      <span className="line-through decoration-foreground/40 text-muted" title="Original price">
        {fmtPhpPlain(list)}
      </span>
      <span className="mx-1 text-muted" aria-hidden>
        /
      </span>
      <span className="font-semibold tabular-nums text-foreground" title="Sale price">
        {fmtPhpPlain(sale)}
      </span>
    </span>
  );
}
