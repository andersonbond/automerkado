import "dotenv/config";

import fs from "fs/promises";
import path from "path";

import { getAppDeployRoot } from "../lib/appDeployRoot";
import { prisma } from "../lib/db";
import {
  buildMetaVehicleCatalogCsv,
  fetchListedCarsForMetaCatalog,
} from "../lib/feeds/metaVehicleCatalog";
import { deactivateExpiredRepossessedListings } from "../lib/services/repossessedExpiry";

const FEED_FILENAME = "meta-inventory.csv";

async function main() {
  try {
    console.log("[export-meta-inventory] start", new Date().toISOString());

    await deactivateExpiredRepossessedListings();

    const cars = await fetchListedCarsForMetaCatalog();
    const { csv, rowCount, skippedNoImage } = buildMetaVehicleCatalogCsv(cars);

    const feedsDir = path.join(getAppDeployRoot(), "public", "feeds");
    await fs.mkdir(feedsDir, { recursive: true });

    const outputPath = path.join(feedsDir, FEED_FILENAME);
    const tempPath = path.join(feedsDir, `.${FEED_FILENAME}.tmp`);

    await fs.writeFile(tempPath, csv, "utf8");
    await fs.rename(tempPath, outputPath);

    console.log("[export-meta-inventory] done", {
      outputPath,
      listedCars: cars.length,
      rowCount,
      skippedNoImage,
    });
  } catch (err) {
    console.error("[export-meta-inventory] failed", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main().then(() => process.exit(process.exitCode ?? 0));
