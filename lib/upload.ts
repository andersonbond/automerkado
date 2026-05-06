import { randomBytes } from "crypto";
import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";
import heicConvert from "heic-convert";
import sharp from "sharp";
import { resolvePublicUploadsPath } from "@/lib/appDeployRoot";

/**
 * Width (px) of the listing-grid thumbnail variant generated on upload.
 * Sized for the largest column in the grid (~400px CSS) at 2× DPR. WebP at
 * q=78 typically lands at 30–80 KB per thumb, vs. multi-MB originals — drops
 * /listings page weight by ~99% and keeps the main thread free of big JPEG
 * decodes when admins click the logo while the grid is still loading.
 */
const LISTING_THUMB_WIDTH = 800;
const LISTING_THUMB_QUALITY = 78;
/** Suffix kept stable so the URL helper + uploads route allow-list match. */
export const LISTING_THUMB_SUFFIX = "_thumb";

export type StoredImage = {
  /** `/uploads/images/<hex>.<ext>` — full-size original (used by detail gallery, admin). */
  path: string;
  /** `/uploads/images/<hex>_thumb.webp` — listing grid thumbnail. Optional in case sharp errors. */
  thumbPath: string | null;
};

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
/**
 * iPhone/iPad photos. Browsers other than Safari can't render HEIC/HEIF, so we
 * accept them at upload but transcode to JPEG before persisting.
 */
const HEIF_IMAGE_TYPES = new Set(["image/heic", "image/heif"]);
const MAX_IMAGE = 10 * 1024 * 1024;
const MAX_HERO_IMAGE = 10 * 1024 * 1024;
/** Short looping hero clips (MP4 / WebM / MOV). */
const MAX_HERO_VIDEO = 45 * 1024 * 1024;

const HERO_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const FILE_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_FILE = 15 * 1024 * 1024;

function extForMime(mime: string) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "video/mp4") return ".mp4";
  if (mime === "video/webm") return ".webm";
  if (mime === "video/quicktime") return ".mov";
  if (mime === "application/pdf") return ".pdf";
  if (mime === "text/plain") return ".txt";
  return ".bin";
}

/**
 * Detects HEIC/HEIF by MIME first, falling back to filename extension because
 * some browsers (mostly desktop Chrome on Linux/Windows) send an empty `type`
 * for `.heic` files dropped from the OS.
 */
function isHeifFile(file: File): boolean {
  if (HEIF_IMAGE_TYPES.has(file.type)) return true;
  return /\.(heic|heif)$/i.test(file.name);
}

/**
 * Generates a small, web-friendly listing-grid thumbnail and writes it next
 * to the original. Returns the public `/uploads/...` URL on success, or null
 * if sharp throws (we accept the original-only result rather than failing the
 * whole upload).
 *
 * The thumb path is derived from the original filename so that:
 *   /uploads/images/abc123.jpg  ->  /uploads/images/abc123_thumb.webp
 * and the same scheme can be used for backfill against existing originals
 * without a DB migration.
 */
export async function writeListingThumbnail(
  originalDiskPath: string,
  originalRelPath: string,
  sourceBuf?: Buffer,
): Promise<string | null> {
  try {
    const baseName = path.basename(
      originalRelPath,
      path.extname(originalRelPath),
    );
    const thumbName = `${baseName}${LISTING_THUMB_SUFFIX}.webp`;
    const thumbDisk = path.join(path.dirname(originalDiskPath), thumbName);
    const thumbRel = `${path.dirname(originalRelPath)}/${thumbName}`;

    const input = sourceBuf ?? originalDiskPath;
    await sharp(input, { failOn: "none" })
      .rotate()
      .resize({ width: LISTING_THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: LISTING_THUMB_QUALITY })
      .toFile(thumbDisk);

    return thumbRel;
  } catch (err) {
    console.error("[upload] thumbnail generation failed", err);
    return null;
  }
}

/**
 * Stores the original full-size image AND a small listing-grid thumbnail.
 * Returns both paths so the new-car upload route can plumb them through.
 */
export async function storeUploadedImageWithThumb(
  file: File,
): Promise<StoredImage | null> {
  const heif = isHeifFile(file);
  if (!heif && !IMAGE_TYPES.has(file.type)) return null;

  const srcBuf = Buffer.from(await file.arrayBuffer());
  if (srcBuf.length > MAX_IMAGE) return null;

  let outBuf: Buffer;
  let outExt: string;
  if (heif) {
    try {
      // sharp's bundled libvips can read HEIF containers but lacks the HEVC
      // decoder plugin, which is what iPhone HEIC photos use. heic-convert
      // ships a WASM libde265 decoder so it works on any platform without
      // extra system packages.
      // heic-convert's runtime path spreads the input (`[...buffer]`) so it
      // actually needs a Uint8Array even though `@types/heic-convert` declares
      // `ArrayBufferLike`. Buffer extends Uint8Array, so passing srcBuf works
      // — the cast just satisfies the (incorrect) typings.
      const decoded = await heicConvert({
        buffer: srcBuf as unknown as ArrayBufferLike,
        format: "JPEG",
        quality: 0.92,
      });
      // Re-encode through sharp to apply EXIF rotate (heic-convert preserves
      // the orientation tag) and to take advantage of mozjpeg's smaller files.
      outBuf = await sharp(Buffer.from(decoded), { failOn: "none" })
        .rotate()
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
      outExt = ".jpg";
    } catch (err) {
      console.error("[upload] HEIC/HEIF transcode failed", err);
      return null;
    }
  } else {
    // JPEG/PNG/WebP: peek at EXIF orientation (header-only metadata read, ~ms,
    // negligible memory) and only re-encode if rotation is actually required.
    // Skipping the rotate-and-re-encode pass for the common orientation=1 case
    // drops peak memory per image roughly 3× — at 20 photos in one submit that
    // saves several hundred MB of heap pressure. Modern browsers honor EXIF
    // `orientation` natively (CSS `image-orientation: from-image` default), so
    // the original bytes display upright either way.
    let needsRotate = false;
    try {
      const meta = await sharp(srcBuf, { failOn: "none" }).metadata();
      const o = meta.orientation;
      needsRotate = typeof o === "number" && o > 1 && o <= 8;
    } catch {
      needsRotate = false;
    }

    if (needsRotate) {
      try {
        outBuf = await sharp(srcBuf, { failOn: "none" }).rotate().toBuffer();
      } catch {
        outBuf = srcBuf;
      }
    } else {
      outBuf = srcBuf;
    }
    outExt = extForMime(file.type);
  }

  const name = randomBytes(16).toString("hex") + outExt;
  const rel = `/uploads/images/${name}`;
  const disk = path.join(resolvePublicUploadsPath("images"), name);
  await mkdir(path.dirname(disk), { recursive: true });
  await writeFile(disk, outBuf);

  const thumbPath = await writeListingThumbnail(disk, rel, outBuf);
  return { path: rel, thumbPath };
}

/** Back-compat shim: existing callers only need the original path. */
export async function storeUploadedImage(file: File): Promise<string | null> {
  const stored = await storeUploadedImageWithThumb(file);
  return stored?.path ?? null;
}

export async function storeUploadedFile(file: File): Promise<string | null> {
  if (!FILE_TYPES.has(file.type)) return null;
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_FILE) return null;
  const name = randomBytes(16).toString("hex") + extForMime(file.type);
  const rel = `/uploads/files/${name}`;
  const disk = path.join(resolvePublicUploadsPath("files"), name);
  await mkdir(path.dirname(disk), { recursive: true });
  await writeFile(disk, buf);
  return rel;
}

const UPLOADS_FILES_PREFIX = "/uploads/files/";

/**
 * Deletes a file created by `storeUploadedFile` when `relPath` matches `/uploads/files/<hex>.<ext>`.
 * No-ops for unknown paths (safety).
 */
export async function unlinkPublicUploadedFile(relPath: string): Promise<void> {
  if (!relPath.startsWith(UPLOADS_FILES_PREFIX)) return;
  const name = relPath.slice(UPLOADS_FILES_PREFIX.length).replace(/\\/g, "/");
  if (!name || name.includes("/") || name.includes("..")) return;
  if (!/^[a-f0-9]{32}\.[a-z0-9]+$/i.test(name)) return;

  const baseDir = path.resolve(resolvePublicUploadsPath("files"));
  const resolved = path.resolve(baseDir, name);
  if (!resolved.startsWith(baseDir + path.sep) && resolved !== baseDir) return;
  await unlink(resolved).catch(() => {});
}

export async function deleteStoredHeroBackgroundFiles(): Promise<void> {
  const dir = resolvePublicUploadsPath("site");
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return;
  }
  await Promise.all(
    names
      .filter((n) => n.startsWith("hero-bg"))
      .map((n) => unlink(path.join(dir, n)).catch(() => {})),
  );
}

function guessHeroMimeFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "";
}

/** Full-bleed home hero under `public/uploads/site/`: image (≤10 MB) or MP4/WebM/MOV loop (≤45 MB). */
export async function storeHeroBackground(file: File): Promise<string | null> {
  const mime = file.type || guessHeroMimeFromFilename(file.name);
  const isImage = IMAGE_TYPES.has(mime);
  const isVideo = HERO_VIDEO_TYPES.has(mime);
  if (!isImage && !isVideo) return null;

  const buf = Buffer.from(await file.arrayBuffer());
  if (isImage && buf.length > MAX_HERO_IMAGE) return null;
  if (isVideo && buf.length > MAX_HERO_VIDEO) return null;

  const ext = extForMime(mime);
  const filename = `hero-bg${ext}`;
  const rel = `/uploads/site/${filename}`;
  const diskDir = resolvePublicUploadsPath("site");
  await mkdir(diskDir, { recursive: true });
  await deleteStoredHeroBackgroundFiles();
  const disk = path.join(diskDir, filename);
  await writeFile(disk, buf);
  return rel;
}

export async function deleteStoredSiteLogoFiles(): Promise<void> {
  const dir = resolvePublicUploadsPath("site");
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return;
  }
  await Promise.all(
    names
      .filter((n) => n.startsWith("site-logo"))
      .map((n) => unlink(path.join(dir, n)).catch(() => {})),
  );
}

/** Replaces any previous `site-logo.*` under `public/uploads/site/`. */
export async function storeSiteLogo(file: File): Promise<string | null> {
  if (!IMAGE_TYPES.has(file.type)) return null;
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_IMAGE) return null;

  const ext = extForMime(file.type);
  const filename = `site-logo${ext}`;
  const rel = `/uploads/site/${filename}`;
  const diskDir = resolvePublicUploadsPath("site");
  await mkdir(diskDir, { recursive: true });
  await deleteStoredSiteLogoFiles();
  const disk = path.join(diskDir, filename);
  await writeFile(disk, buf);
  return rel;
}
