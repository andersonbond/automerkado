import "dotenv/config";

import { access, stat } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { resolvePublicUploadsPath } from "@/lib/appDeployRoot";
import { writeListingThumbnail } from "@/lib/upload";

/**
 * Generates the small `_thumb.webp` variant for every existing CarImage that
 * doesn't already have one. Idempotent — re-runs are cheap (only missing
 * thumbs are produced).
 *
 * Why we need this: `lib/upload.ts` only started writing thumbnails after the
 * grid-perf change. Anything uploaded before that has only the original
 * full-size file on disk, so the listings grid would 404 on `_thumb.webp`.
 *
 * Run once after deploying the grid-thumb change:
 *
 *   npm run backfill:listing-thumbnails
 *
 * On the prod box, with PM2 still serving the previous build that's fine —
 * the new thumbs are just extra files, ignored by the running process.
 */

const ORIGINAL_RE =
  /^\/uploads\/images\/[a-f0-9]{32}\.(?:jpe?g|png|webp)$/i;

const prisma = new PrismaClient();

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const rows = await prisma.carImage.findMany({
    select: { id: true, path: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(`[backfill] examining ${rows.length} CarImage rows`);

  let made = 0;
  let skipped = 0;
  let failed = 0;
  let unsupported = 0;

  for (const row of rows) {
    if (!ORIGINAL_RE.test(row.path)) {
      unsupported++;
      continue;
    }

    const originalDisk = path.join(
      resolvePublicUploadsPath(),
      ...row.path.replace(/^\/uploads\//, "").split("/"),
    );
    const baseName = path.basename(row.path, path.extname(row.path));
    const thumbDisk = path.join(
      path.dirname(originalDisk),
      `${baseName}_thumb.webp`,
    );

    if (await fileExists(thumbDisk)) {
      skipped++;
      continue;
    }

    if (!(await fileExists(originalDisk))) {
      console.warn(
        `[backfill] original missing on disk, skipping: ${row.path}`,
      );
      failed++;
      continue;
    }

    const thumbRel = await writeListingThumbnail(originalDisk, row.path);
    if (!thumbRel) {
      console.warn(`[backfill] sharp failed for: ${row.path}`);
      failed++;
      continue;
    }

    try {
      const s = await stat(thumbDisk);
      console.log(
        `[backfill] wrote ${thumbRel} (${(s.size / 1024).toFixed(1)} KB)`,
      );
    } catch {
      console.log(`[backfill] wrote ${thumbRel}`);
    }
    made++;
  }

  console.log(
    `[backfill] done — made=${made} skipped=${skipped} failed=${failed} unsupported_path=${unsupported}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
