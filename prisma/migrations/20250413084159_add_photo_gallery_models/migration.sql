-- CreateTable
CREATE TABLE "PhotoTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "LabPhoto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "alt_text" TEXT,
    "location" TEXT,
    "taken_at" DATETIME,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LabPhotoTag" (
    "photo_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("photo_id", "tag_id"),
    CONSTRAINT "LabPhotoTag_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "LabPhoto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LabPhotoTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "PhotoTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PhotoTag_name_key" ON "PhotoTag"("name");

-- CreateIndex
CREATE INDEX "LabPhoto_taken_at_idx" ON "LabPhoto"("taken_at");

-- CreateIndex
CREATE INDEX "LabPhoto_is_featured_idx" ON "LabPhoto"("is_featured");

-- CreateIndex
CREATE INDEX "LabPhotoTag_tag_id_idx" ON "LabPhotoTag"("tag_id");
