-- AlterTable
ALTER TABLE "Publication" ADD COLUMN "raw_authors" TEXT;
ALTER TABLE "Publication" ADD COLUMN "source" TEXT;
ALTER TABLE "Publication" ADD COLUMN "status" TEXT DEFAULT 'published';
