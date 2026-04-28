import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { postBidHandler } from "@/lib/controllers/bidController";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await postBidHandler({
    carId: id,
    userId: session.user.id,
    userEmail: session.user.email,
    body,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Error" },
      { status: result.status },
    );
  }

  return NextResponse.json(
    { id: result.bid.id, amount: result.bid.amount.toString() },
    { status: 201 },
  );
}
