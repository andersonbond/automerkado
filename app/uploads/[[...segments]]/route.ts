import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { resolvePublicUploadsPath } from "@/lib/appDeployRoot";

export const runtime = "nodejs";

/**
 * Allows the original `<32-hex>.<ext>` filename plus the listing-grid thumb
 * variant `<32-hex>_thumb.webp` produced by `writeListingThumbnail` in
 * `lib/upload.ts`. Thumbs are always WebP regardless of the original format.
 */
const IMAGE_RE = /^[a-f0-9]{32}(?:_thumb\.webp|\.(?:jpe?g|png|webp))$/i;
const FILE_RE = /^[a-f0-9]{32}\.(pdf|txt|jpe?g|png|webp)$/i;
const SITE_RE =
  /^(site-logo\.(jpe?g|png|webp)|hero-bg\.(jpe?g|png|webp|mp4|webm|mov))$/i;

function contentTypeForExt(ext: string): string {
  const e = ext.toLowerCase().replace(/^\./, "");
  switch (e) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "pdf":
      return "application/pdf";
    case "txt":
      return "text/plain; charset=utf-8";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    default:
      return "application/octet-stream";
  }
}

function resolvedPathUnderUploads(absFile: string): boolean {
  const root = path.resolve(resolvePublicUploadsPath());
  const file = path.resolve(absFile);
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  return file === root || file.startsWith(prefix);
}

/**
 * Serve user uploads from `AUTOMERKADO_APP_ROOT/public/uploads` so reads match writes and nginx/CF cannot point at the wrong disk tree.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ segments?: string[] }> },
): Promise<Response> {
  const { segments } = await context.params;
  if (!segments?.length) {
    return new NextResponse(null, { status: 404 });
  }

  const safeSegs = segments.map((s) => s.replace(/\\/g, "/")).filter(Boolean);
  if (safeSegs.some((s) => s.includes(".."))) {
    return new NextResponse(null, { status: 404 });
  }

  const bucket = safeSegs[0];
  if (bucket !== "images" && bucket !== "files" && bucket !== "site") {
    return new NextResponse(null, { status: 404 });
  }

  const rest = safeSegs.slice(1);
  if (bucket === "images" || bucket === "files") {
    if (rest.length !== 1) return new NextResponse(null, { status: 404 });
    const name = rest[0]!;
    const ok = bucket === "images" ? IMAGE_RE.test(name) : FILE_RE.test(name);
    if (!ok) return new NextResponse(null, { status: 404 });
  } else {
    if (rest.length !== 1) return new NextResponse(null, { status: 404 });
    if (!SITE_RE.test(rest[0]!)) return new NextResponse(null, { status: 404 });
  }

  const absFile = resolvePublicUploadsPath(...safeSegs);
  if (!resolvedPathUnderUploads(absFile)) {
    return new NextResponse(null, { status: 404 });
  }

  let st;
  try {
    st = await stat(absFile);
  } catch {
    return new NextResponse(null, { status: 404 });
  }
  if (!st.isFile()) {
    return new NextResponse(null, { status: 404 });
  }

  const fileLast = safeSegs[safeSegs.length - 1]!;
  const ext = path.extname(fileLast);
  const type = contentTypeForExt(ext);
  const stream = createReadStream(absFile);
  const web = Readable.toWeb(stream);

  return new NextResponse(web as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Length": String(st.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
