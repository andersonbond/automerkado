import "dotenv/config";

import { prisma } from "../lib/db";
import { deactivateExpiredRepossessedListings } from "../lib/services/repossessedExpiry";

async function main() {
  try {
    console.log("[repossessed-expiry-worker] start", new Date().toISOString());
    await deactivateExpiredRepossessedListings();
    console.log("[repossessed-expiry-worker] done", new Date().toISOString());
  } catch (err) {
    console.error("[repossessed-expiry-worker] failed", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main().then(() => process.exit(process.exitCode ?? 0));
