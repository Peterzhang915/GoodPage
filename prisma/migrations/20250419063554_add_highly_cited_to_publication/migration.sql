-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "updatedAt" DATETIME NOT NULL,
    "isHighlyCited" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Publication" ("abstract", "authors_full_string", "ccf_rank", "code_repository_url", "createdAt", "dblp_url", "id", "is_peer_reviewed", "keywords", "number", "pages", "pdf_url", "project_page_url", "publication_status", "publisher", "slides_url", "title", "type", "updatedAt", "venue", "video_url", "volume", "year") SELECT "abstract", "authors_full_string", "ccf_rank", "code_repository_url", "createdAt", "dblp_url", "id", "is_peer_reviewed", "keywords", "number", "pages", "pdf_url", "project_page_url", "publication_status", "publisher", "slides_url", "title", "type", "updatedAt", "venue", "video_url", "volume", "year" FROM "Publication";
DROP TABLE "Publication";
ALTER TABLE "new_Publication" RENAME TO "Publication";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
