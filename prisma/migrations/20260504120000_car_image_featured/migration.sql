-- AlterTable
ALTER TABLE "CarImage" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- One featured image per car: smallest (sortOrder, rowid) wins.
UPDATE "CarImage"
SET "isFeatured" = true
WHERE "rowid" IN (
  SELECT "x"."rowid"
  FROM "CarImage" AS "x"
  WHERE "x"."carId" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM "CarImage" AS "y"
      WHERE "y"."carId" = "x"."carId"
        AND (
          "y"."sortOrder" < "x"."sortOrder"
          OR (
            "y"."sortOrder" = "x"."sortOrder"
            AND "y"."rowid" < "x"."rowid"
          )
        )
    )
);
