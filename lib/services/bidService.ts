import { Prisma } from "@prisma/client";
import { isWeeklyBiddingOpen } from "@/lib/bidding/weeklyClose";
import { sendBidConfirmationEmail } from "@/lib/mail/sendBidConfirmation";
import { prisma } from "@/lib/db";
import { deactivateExpiredRepossessedListings } from "@/lib/services/repossessedExpiry";
import { effectiveHighBidDecimal } from "@/lib/services/effectiveListingBid";

const MIN_INCREMENT = new Prisma.Decimal(1000);

export class BidError extends Error {
  constructor(
    message: string,
    public code:
      | "UNAUTHORIZED"
      | "NOT_FOUND"
      | "CLOSED"
      | "TOO_LOW"
      | "INVALID",
  ) {
    super(message);
    this.name = "BidError";
  }
}

function formatMoney(amount: Prisma.Decimal) {
  const n = amount.toNumber();
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n);
}

export async function placeBid(params: {
  carId: string;
  userId: string;
  userEmail: string;
  amountRaw: string;
}) {
  const { carId, userId, userEmail, amountRaw } = params;

  let amount: Prisma.Decimal;
  try {
    amount = new Prisma.Decimal(amountRaw);
  } catch {
    throw new BidError("Invalid amount", "INVALID");
  }

  if (amount.lte(0)) {
    throw new BidError("Amount must be positive", "INVALID");
  }

  await deactivateExpiredRepossessedListings();

  const car = await prisma.car.findUnique({
    where: { id: carId },
  });

  if (!car || car.status !== "LISTED") {
    throw new BidError("Car not found", "NOT_FOUND");
  }

  if (car.biddingManuallyClosed) {
    throw new BidError("Bidding is closed for this vehicle.", "CLOSED");
  }

  if (!isWeeklyBiddingOpen()) {
    throw new BidError(
      "The weekly bidding window is closed (Thursday–Friday and after Wednesday 4:00 PM Manila time).",
      "CLOSED",
    );
  }

  const high = await effectiveHighBidDecimal(car.id);
  const minNext = high
    ? high.add(MIN_INCREMENT)
    : new Prisma.Decimal(car.price);
  if (amount.lt(minNext)) {
    throw new BidError(
      `Bid must be at least ${formatMoney(minNext)}.`,
      "TOO_LOW",
    );
  }

  const bid = await prisma.bid.create({
    data: {
      carId: car.id,
      userId,
      amount,
    },
  });

  void sendBidConfirmationEmail({
    to: userEmail,
    carTitle: car.title,
    amountLabel: formatMoney(amount),
  }).catch((err) => console.error("[mail] bid confirmation failed", err));

  return bid;
}
