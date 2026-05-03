-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CarToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CarToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CarToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_CarToTag_AB_unique" ON "_CarToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_CarToTag_B_index" ON "_CarToTag"("B");
