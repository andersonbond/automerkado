import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { storeUploadedImage } from "@/lib/upload";

/**
 * Per-image upload endpoint used by the admin "New car" form so we can show
 * per-file progress + ETA in the UI. Server-action multipart submits only
 * surface a single cumulative progress event, which is why we pre-upload here
 * and then send the resulting paths with the final form submission.
 *
 * Body: multipart/form-data with `file`. Returns `{ path: "/uploads/images/..." }`
 * on success or `{ error: "..." }` with HTTP 400/401/415 on failure.
 *
 * Force the Node runtime — Sharp + heic-convert require it.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Malformed upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const stored = await storeUploadedImage(file);
  if (!stored) {
    return NextResponse.json(
      {
        error:
          "Image rejected. Use JPEG/PNG/WebP/HEIC under 10 MB.",
      },
      { status: 415 },
    );
  }

  return NextResponse.json({ path: stored });
}
