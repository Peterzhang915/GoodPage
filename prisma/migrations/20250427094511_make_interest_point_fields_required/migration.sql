/*
  Warnings:

  - Made the column `description` on table `interest_points` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `interest_points` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_interest_points" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_interest_points" ("createdAt", "description", "display_order", "id", "is_visible", "title", "updatedAt") SELECT "createdAt", "description", "display_order", "id", "is_visible", "title", "updatedAt" FROM "interest_points";
DROP TABLE "interest_points";
ALTER TABLE "new_interest_points" RENAME TO "interest_points";
CREATE INDEX "interest_points_display_order_idx" ON "interest_points"("display_order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
