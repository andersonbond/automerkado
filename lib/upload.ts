import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE = 5 * 1024 * 1024;

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
