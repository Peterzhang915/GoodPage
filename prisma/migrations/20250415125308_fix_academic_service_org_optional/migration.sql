/*
  Warnings:

  - You are about to drop the column `event` on the `AcademicService` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AcademicService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "organization" TEXT,
    "year" TEXT,
    "details" TEXT,
    "link_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AcademicService_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AcademicService" ("display_order", "id", "member_id", "role", "year") SELECT "display_order", "id", "member_id", "role", "year" FROM "AcademicService";
DROP TABLE "AcademicService";
ALTER TABLE "new_AcademicService" RENAME TO "AcademicService";
CREATE INDEX "AcademicService_member_id_idx" ON "AcademicService"("member_id");
CREATE TABLE "new_Award" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT,
    "year" INTEGER,
    "award_type" TEXT,
    "description" TEXT,
    "link_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Award_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Award" ("award_type", "description", "display_order", "id", "link_url", "member_id", "organization", "title", "year") SELECT "award_type", "description", "display_order", "id", "link_url", "member_id", "organization", "title", "year" FROM "Award";
DROP TABLE "Award";
ALTER TABLE "new_Award" RENAME TO "Award";
CREATE INDEX "Award_member_id_idx" ON "Award"("member_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
