-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PublicationAuthor" (
    "publication_id" INTEGER NOT NULL,
    "member_id" TEXT NOT NULL,
    "author_order" INTEGER NOT NULL,
    "is_corresponding_author" BOOLEAN NOT NULL DEFAULT false,
    "isFeaturedOnProfile" BOOLEAN NOT NULL DEFAULT false,
    "profileDisplayOrder" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("publication_id", "member_id"),
    CONSTRAINT "PublicationAuthor_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "Publication" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublicationAuthor_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PublicationAuthor" ("author_order", "is_corresponding_author", "member_id", "publication_id") SELECT "author_order", "is_corresponding_author", "member_id", "publication_id" FROM "PublicationAuthor";
DROP TABLE "PublicationAuthor";
ALTER TABLE "new_PublicationAuthor" RENAME TO "PublicationAuthor";
CREATE INDEX "PublicationAuthor_member_id_idx" ON "PublicationAuthor"("member_id");
CREATE INDEX "PublicationAuthor_member_id_isFeaturedOnProfile_profileDisplayOrder_idx" ON "PublicationAuthor"("member_id", "isFeaturedOnProfile", "profileDisplayOrder");
CREATE UNIQUE INDEX "PublicationAuthor_publication_id_author_order_key" ON "PublicationAuthor"("publication_id", "author_order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
