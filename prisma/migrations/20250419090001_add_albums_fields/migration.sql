-- AlterTable
ALTER TABLE "GalleryPhoto" ADD COLUMN "show_in_albums" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "GalleryPhoto" ADD COLUMN "albums_order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "GalleryPhoto_show_in_albums_idx" ON "GalleryPhoto"("show_in_albums"); 