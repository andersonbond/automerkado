import { readdir, stat } from "fs/promises";
import path from "path";

async function dirSizeBytes(absDir: string): Promise<number> {
  let total = 0;
  let entries;
  try {
    entries = await readdir(absDir, { withFileTypes: true });
  } catch (e: unknown) {
    const code = typeof e === "object" && e && "code" in e ? (e as NodeJS.ErrnoException).code : "";
    if (code === "ENOENT") return 0;
    throw e;
  }
  for (const ent of entries) {
    const full = path.join(absDir, ent.name);
    if (ent.isDirectory()) total += await dirSizeBytes(full);
    else if (ent.isFile()) total += (await stat(full)).size;
  }
  return total;
}

/** Sum of listing images and site logo files under `public/uploads/images` and `public/uploads/site`. */
export async function sumUploadImageStorageBytes(): Promise<number> {
  const cwd = process.cwd();
  const roots = [
    path.join(cwd, "public", "uploads", "images"),
    path.join(cwd, "public", "uploads", "site"),
  ];
  let total = 0;
  for (const root of roots) {
    total += await dirSizeBytes(root);
  }
  return total;
}

const DEFAULT_SYSTEM_FILES_ALLOCATION_MB = 500;

/**
 * Baseline counted toward the site storage meter for runtime/system footprint (e.g. Node, `node_modules`).
 * Fixed planning allowance, not measured on disk. Override with `ADMIN_SYSTEM_STORAGE_ALLOCATION_MB`
 * (megabytes). Default 500 MB.
 */
export function systemFilesAllocationBytes(): number {
  const raw = process.env.ADMIN_SYSTEM_STORAGE_ALLOCATION_MB?.trim();
  const mb = raw ? Number.parseFloat(raw) : DEFAULT_SYSTEM_FILES_ALLOCATION_MB;
  if (!Number.isFinite(mb) || mb < 0) return DEFAULT_SYSTEM_FILES_ALLOCATION_MB * 1024 * 1024;
  return Math.round(mb * 1024 * 1024);
}

const DEFAULT_QUOTA_MB = 5 * 1024; /* 5 GB */

/**
 * Soft budget for the site storage bar on the admin dashboard (not enforced server-side).
 * Set `ADMIN_IMAGE_STORAGE_QUOTA_MB` (megabytes). Defaults to 5 GB (5120 MB).
 */
export function imageStorageQuotaBytes(): number {
  const raw = process.env.ADMIN_IMAGE_STORAGE_QUOTA_MB?.trim();
  const mb = raw ? Number.parseFloat(raw) : DEFAULT_QUOTA_MB;
  if (!Number.isFinite(mb) || mb <= 0) return DEFAULT_QUOTA_MB * 1024 * 1024;
  return Math.round(mb * 1024 * 1024);
}

export function formatStorageBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
  const gb = mb / 1024;
  return `${gb < 10 ? gb.toFixed(2) : gb.toFixed(1)} GB`;
}
