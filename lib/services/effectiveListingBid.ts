import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const REPOD_BID_KIND = "REPOSSESSED_BID" as const;

/**
 * Highest offer on a listing considers both authenticated `Bid` rows and public
 * `CarInquiry` rows with kind REPOSSESSED_BID and a numeric `bidAmount`.
 */
export async function effectiveHighBidDecimal(
  carId: string,
): Promise<Prisma.Decimal | null> {
  const [topBid, inquiryAgg] = await Promise.all([
    prisma.bid.findFirst({
      where: { carId },
      orderBy: { amount: "desc" },
      select: { amount: true },
    }),
    prisma.carInquiry.aggregate({
      where: {
        carId,
        kind: REPOD_BID_KIND,
        bidAmount: { not: null },
      },
      _max: { bidAmount: true },
    }),
  ]);

  const parts: Prisma.Decimal[] = [];
  if (topBid) parts.push(topBid.amount);
  const iq = inquiryAgg._max.bidAmount;
  if (iq) parts.push(iq);
  if (parts.length === 0) return null;
  return parts.reduce((a, b) => (a.gt(b) ? a : b));
}
