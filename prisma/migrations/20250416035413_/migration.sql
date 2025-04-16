/*
  Warnings:

  - You are about to drop the column `organization` on the `Award` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Award` table. All the data in the column will be lost.
  - You are about to drop the column `sponsor` on the `Sponsorship` table. All the data in the column will be lost.
  - Added the required column `content` to the `Award` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Award" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "year" INTEGER,
    "level" TEXT NOT NULL DEFAULT 'OTHER',
    "link_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Award_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Award" ("display_order", "id", "isFeatured", "level", "link_url", "member_id", "year") SELECT "display_order", "id", "isFeatured", "level", "link_url", "member_id", "year" FROM "Award";
DROP TABLE "Award";
ALTER TABLE "new_Award" RENAME TO "Award";
CREATE INDEX "Award_member_id_idx" ON "Award"("member_id");
CREATE INDEX "Award_year_idx" ON "Award"("year");
CREATE INDEX "Award_display_order_idx" ON "Award"("display_order");
CREATE TABLE "new_Sponsorship" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "period" TEXT,
    "link_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Sponsorship_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Sponsorship" ("content", "display_order", "id", "isFeatured", "link_url", "member_id", "period") SELECT "content", "display_order", "id", "isFeatured", "link_url", "member_id", "period" FROM "Sponsorship";
DROP TABLE "Sponsorship";
ALTER TABLE "new_Sponsorship" RENAME TO "Sponsorship";
CREATE INDEX "Sponsorship_member_id_idx" ON "Sponsorship"("member_id");
CREATE INDEX "Sponsorship_display_order_idx" ON "Sponsorship"("display_order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
