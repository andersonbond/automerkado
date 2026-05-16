import type { Prisma } from "@prisma/client";
import { ListingPriceSlashPair } from "@/components/listings/listing-price-slash";
import { REPOSSESSED_CATEGORY_SLUG } from "@/lib/repossessedListing";

type Props = {
  listPrice: Prisma.Decimal;
  salePrice: Prisma.Decimal | null;
  categorySlug: string;
  topBid: Prisma.Decimal | undefined;
  paragraphClassName?: string;
};

export function ListingCardPriceLine({
  listPrice,
  salePrice,
  categorySlug,
  topBid,
  paragraphClassName = "mt-3 text-sm",
}: Props) {
  const hasSale = salePrice != null;
  const isRepo = categorySlug === REPOSSESSED_CATEGORY_SLUG;
  const fromAmount = topBid ?? listPrice;

  if (hasSale) {
    const pair = (
      <ListingPriceSlashPair listPrice={listPrice} salePrice={salePrice!} />
    );
    if (isRepo && topBid) {
      return (
        <p className={paragraphClassName}>
          <span className="text-muted">From </span>
          <span className="font-semibold tabular-nums text-foreground">
            PHP {Number(topBid).toLocaleString("en-PH")}
          </span>
          <span className="mt-1 block text-xs font-normal leading-relaxed">
            <span className="text-muted">List </span>
            {pair}
          </span>
        </p>
      );
    }
    return <p className={paragraphClassName}>{pair}</p>;
  }

  return (
    <p className={paragraphClassName}>
      <span className="text-muted">From </span>
      <span className="font-semibold tabular-nums text-foreground">
        PHP {Number(fromAmount).toLocaleString("en-PH")}
      </span>
    </p>
  );
}
