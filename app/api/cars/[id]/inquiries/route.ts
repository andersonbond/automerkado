import { NextResponse } from "next/server";
import { postCarInquiryHandler } from "@/lib/controllers/carInquiryController";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await postCarInquiryHandler(id, body);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Error" },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true }, { status: result.status });
}
