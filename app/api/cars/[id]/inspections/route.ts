import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  InspectionError,
  createInspectionRequest,
} from "@/lib/services/inspectionService";

const bodySchema = z.object({
  note: z.string().max(2000).optional(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 422 });
  }

  try {
    const row = await createInspectionRequest({
      carId: id,
      userId: session.user.id,
      note: parsed.data.note,
    });
    return NextResponse.json({ id: row.id }, { status: 201 });
  } catch (e) {
    if (e instanceof InspectionError) {
      return NextResponse.json(
        { error: e.message },
        { status: e.code === "NOT_FOUND" ? 404 : 401 },
      );
    }
    throw e;
  }
}
