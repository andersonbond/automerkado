-- CreateTable
CREATE TABLE "CarInquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "carId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "bidAmount" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CarInquiry_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CarInquiry_carId_idx" ON "CarInquiry"("carId");

-- CreateIndex
CREATE INDEX "CarInquiry_kind_idx" ON "CarInquiry"("kind");
