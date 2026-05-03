import { Prisma } from "@prisma/client";
import { z } from "zod";
import { isWeeklyBiddingOpen } from "@/lib/bidding/weeklyClose";
import {
  CERTIFIED_CATEGORY_SLUG,
  REPOSSESSED_CATEGORY_SLUG,
} from "@/lib/carListingCategories";
import { prisma } from "@/lib/db";

const MOBILE = z
  .string()
  .trim()
  .regex(/^\d{11}$/, "Mobile number must be exactly 11 digits.");

const optionalEmail = z
  .union([z.string().email(), z.literal("")])
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const messageField = z
  .string()
  .trim()
  .max(4000)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const testDriveSchema = z.object({
  kind: z.literal("TEST_DRIVE"),
  firstName: z.string().trim().min(1, "First name is required.").max(120),
  mobile: MOBILE,
  email: optionalEmail,
  message: messageField,
});

const repossessedBidSchema = z.object({
  kind: z.literal("REPOSSESSED_BID"),
  firstName: z.string().trim().min(1, "First name is required.").max(120),
  mobile: MOBILE,
  email: optionalEmail,
  message: messageField,
  bidAmount: z.string().trim().min(1, "Bid amount is required."),
});

export async function postCarInquiryHandler(carId: string, body: unknown) {
  const discriminated = z.discriminatedUnion("kind", [
    testDriveSchema,
    repossessedBidSchema,
  ]);

  const parsed = discriminated.safeParse(body);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ?? "Invalid request.";
    return { ok: false as const, status: 400 as const, error: msg };
  }

  const data = parsed.data;

  const car = await prisma.car.findFirst({
    where: { id: carId, status: "LISTED" },
    include: {
      category: true,
      bids: { orderBy: { amount: "desc" }, take: 1, select: { amount: true } },
    },
  });

  if (!car) {
    return { ok: false as const, status: 404 as const, error: "Car not found." };
  }

  if (data.kind === "TEST_DRIVE") {
    if (car.category.slug !== CERTIFIED_CATEGORY_SLUG) {
      return {
        ok: false as const,
        status: 400 as const,
        error: "Test drive requests are only for certified listings.",
      };
    }

    await prisma.carInquiry.create({
      data: {
        carId: car.id,
        kind: "TEST_DRIVE",
        firstName: data.firstName,
        mobile: data.mobile,
        email: data.email ?? null,
        message: data.message ?? null,
        bidAmount: null,
      },
    });

    return { ok: true as const, status: 201 as const };
  }

  if (car.category.slug !== REPOSSESSED_CATEGORY_SLUG) {
    return {
      ok: false as const,
      status: 400 as const,
      error: "Bid submissions are only for repossessed listings.",
    };
  }

  if (car.biddingManuallyClosed) {
    return {
      ok: false as const,
      status: 400 as const,
      error: "Bidding is closed for this vehicle.",
    };
  }

  if (!isWeeklyBiddingOpen()) {
    return {
      ok: false as const,
      status: 400 as const,
      error:
        "The weekly bidding window is closed (Thursday–Friday and after Wednesday 4:00 PM Manila time).",
    };
  }

  const normalizedAmount = data.bidAmount.replace(/,/g, "").trim();
  let amount: Prisma.Decimal;
  try {
    amount = new Prisma.Decimal(normalizedAmount);
  } catch {
    return {
      ok: false as const,
      status: 400 as const,
      error: "Invalid bid amount.",
    };
  }

  if (amount.lte(0)) {
    return {
      ok: false as const,
      status: 400 as const,
      error: "Bid amount must be positive.",
    };
  }

  const high = car.bids[0]?.amount;
  const MIN_INC = new Prisma.Decimal(1000);
  const minNext = high ? high.add(MIN_INC) : new Prisma.Decimal(car.price);

  if (amount.lt(minNext)) {
    return {
      ok: false as const,
      status: 400 as const,
      error: `Bid must be at least ${minNext.toString()} PHP.`,
    };
  }

  await prisma.carInquiry.create({
    data: {
      carId: car.id,
      kind: "REPOSSESSED_BID",
      firstName: data.firstName,
      mobile: data.mobile,
      email: data.email ?? null,
      message: data.message ?? null,
      bidAmount: amount,
    },
  });

  return { ok: true as const, status: 201 as const };
}
