/*
  Warnings:

  - You are about to drop the column `details` on the `AcademicService` table. All the data in the column will be lost.
  - You are about to drop the column `link_url` on the `AcademicService` table. All the data in the column will be lost.
  - You are about to drop the column `organization` on the `AcademicService` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `AcademicService` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `AcademicService` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AcademicService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AcademicService_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AcademicService" ("display_order", "id", "isFeatured", "member_id") SELECT "display_order", "id", "isFeatured", "member_id" FROM "AcademicService";
DROP TABLE "AcademicService";
ALTER TABLE "new_AcademicService" RENAME TO "AcademicService";
CREATE INDEX "AcademicService_member_id_idx" ON "AcademicService"("member_id");
CREATE INDEX "AcademicService_display_order_idx" ON "AcademicService"("display_order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
