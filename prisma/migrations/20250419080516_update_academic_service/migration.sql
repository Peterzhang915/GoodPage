/*
  Warnings:

  - You are about to drop the column `content` on the `AcademicService` table. All the data in the column will be lost.
  - You are about to drop the column `isHighlyCited` on the `Publication` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AcademicService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "organization" TEXT,
    "role" TEXT,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AcademicService_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AcademicService" ("display_order", "id", "isFeatured", "member_id") SELECT "display_order", "id", "isFeatured", "member_id" FROM "AcademicService";
DROP TABLE "AcademicService";
ALTER TABLE "new_AcademicService" RENAME TO "AcademicService";
CREATE INDEX "AcademicService_member_id_idx" ON "AcademicService"("member_id");
CREATE INDEX "AcademicService_display_order_idx" ON "AcademicService"("display_order");
CREATE TABLE "new_Publication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "year" INTEGER NOT NULL,
    "volume" TEXT,
    "number" TEXT,
    "pages" TEXT,
    "publisher" TEXT,
    "ccf_rank" TEXT,
    "dblp_url" TEXT,
    "pdf_url" TEXT,
    "abstract" TEXT,
    "keywords" TEXT,
    "type" TEXT DEFAULT 'CONFERENCE',
    "slides_url" TEXT,
    "video_url" TEXT,
    "code_repository_url" TEXT,
    "project_page_url" TEXT,
    "is_peer_reviewed" BOOLEAN,
    "publication_status" TEXT,
    "authors_full_string" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Publication" ("abstract", "authors_full_string", "ccf_rank", "code_repository_url", "createdAt", "dblp_url", "id", "is_peer_reviewed", "keywords", "number", "pages", "pdf_url", "project_page_url", "publication_status", "publisher", "slides_url", "title", "type", "updatedAt", "venue", "video_url", "volume", "year") SELECT "abstract", "authors_full_string", "ccf_rank", "code_repository_url", "createdAt", "dblp_url", "id", "is_peer_reviewed", "keywords", "number", "pages", "pdf_url", "project_page_url", "publication_status", "publisher", "slides_url", "title", "type", "updatedAt", "venue", "video_url", "volume", "year" FROM "Publication";
DROP TABLE "Publication";
ALTER TABLE "new_Publication" RENAME TO "Publication";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
