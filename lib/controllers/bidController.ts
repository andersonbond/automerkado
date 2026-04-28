import { z } from "zod";
import { BidError, placeBid } from "@/lib/services/bidService";

const bodySchema = z.object({
  amount: z.string().min(1).max(32),
});

export async function postBidHandler(input: {
  carId: string;
  userId: string;
  userEmail: string;
  body: unknown;
}) {
  const parsed = bodySchema.safeParse(input.body);
  if (!parsed.success) {
    return { ok: false as const, status: 422, error: "Invalid body" };
  }

  try {
    const bid = await placeBid({
      carId: input.carId,
      userId: input.userId,
      userEmail: input.userEmail,
      amountRaw: parsed.data.amount,
    });
    return { ok: true as const, status: 201, bid };
  } catch (e) {
    if (e instanceof BidError) {
      const map: Record<BidError["code"], number> = {
        UNAUTHORIZED: 401,
        NOT_FOUND: 404,
        CLOSED: 403,
        TOO_LOW: 400,
        INVALID: 400,
      };
      return {
        ok: false as const,
        status: map[e.code],
        error: e.message,
      };
    }
    throw e;
  }
}
