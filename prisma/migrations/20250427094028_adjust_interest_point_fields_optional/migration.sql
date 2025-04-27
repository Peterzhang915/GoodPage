/*
  Warnings:

  - You are about to drop the column `text` on the `interest_points` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_interest_points" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_interest_points" ("createdAt", "display_order", "id", "is_visible", "updatedAt") SELECT "createdAt", "display_order", "id", "is_visible", "updatedAt" FROM "interest_points";
DROP TABLE "interest_points";
ALTER TABLE "new_interest_points" RENAME TO "interest_points";
CREATE INDEX "interest_points_display_order_idx" ON "interest_points"("display_order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
