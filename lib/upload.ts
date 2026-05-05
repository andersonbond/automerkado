import { randomBytes } from "crypto";
import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE = 5 * 1024 * 1024;
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

export async function storeUploadedImage(file: File): Promise<string | null> {
  if (!IMAGE_TYPES.has(file.type)) return null;
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_IMAGE) return null;
  const name = randomBytes(16).toString("hex") + extForMime(file.type);
  const rel = `/uploads/images/${name}`;
  const disk = path.join(process.cwd(), "public", "uploads", "images", name);
  await mkdir(path.dirname(disk), { recursive: true });
  await writeFile(disk, buf);
  return rel;
}

export async function storeUploadedFile(file: File): Promise<string | null> {
  if (!FILE_TYPES.has(file.type)) return null;
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_FILE) return null;
  const name = randomBytes(16).toString("hex") + extForMime(file.type);
  const rel = `/uploads/files/${name}`;
  const disk = path.join(process.cwd(), "public", "uploads", "files", name);
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

  const baseDir = path.resolve(process.cwd(), "public", "uploads", "files");
  const resolved = path.resolve(baseDir, name);
  if (!resolved.startsWith(baseDir + path.sep) && resolved !== baseDir) return;
  await unlink(resolved).catch(() => {});
}

export async function deleteStoredHeroBackgroundFiles(): Promise<void> {
  const dir = path.join(process.cwd(), "public", "uploads", "site");
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
  const diskDir = path.join(process.cwd(), "public", "uploads", "site");
  await mkdir(diskDir, { recursive: true });
  await deleteStoredHeroBackgroundFiles();
  const disk = path.join(diskDir, filename);
  await writeFile(disk, buf);
  return rel;
}

export async function deleteStoredSiteLogoFiles(): Promise<void> {
  const dir = path.join(process.cwd(), "public", "uploads", "site");
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
  const diskDir = path.join(process.cwd(), "public", "uploads", "site");
  await mkdir(diskDir, { recursive: true });
  await deleteStoredSiteLogoFiles();
  const disk = path.join(diskDir, filename);
  await writeFile(disk, buf);
  return rel;
}
