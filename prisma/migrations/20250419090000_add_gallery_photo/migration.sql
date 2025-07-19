-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "caption" TEXT,
    "date" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GalleryPhoto_filename_key" ON "GalleryPhoto"("filename");

-- CreateIndex
CREATE INDEX "GalleryPhoto_category_is_visible_idx" ON "GalleryPhoto"("category", "is_visible"); 