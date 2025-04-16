/*
  Warnings:

  - You are about to drop the column `award_type` on the `Award` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Award` table. All the data in the column will be lost.
  - You are about to drop the column `dblp_id` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `github_url` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `orcid_id` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `semantic_scholar_id` on the `Member` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Sponsorship" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sponsor" TEXT,
    "period" TEXT,
    "link_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Sponsorship_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Award" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT,
    "year" INTEGER,
    "level" TEXT NOT NULL DEFAULT 'OTHER',
    "link_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Award_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Award" ("display_order", "id", "isFeatured", "link_url", "member_id", "organization", "title", "year") SELECT "display_order", "id", "isFeatured", "link_url", "member_id", "organization", "title", "year" FROM "Award";
DROP TABLE "Award";
ALTER TABLE "new_Award" RENAME TO "Award";
CREATE INDEX "Award_member_id_idx" ON "Award"("member_id");
CREATE INDEX "Award_year_idx" ON "Award"("year");
CREATE INDEX "Award_display_order_idx" ON "Award"("display_order");
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "name_zh" TEXT,
    "status" TEXT NOT NULL,
    "enrollment_year" INTEGER,
    "graduation_year" INTEGER,
    "title_zh" TEXT,
    "title_en" TEXT,
    "major" TEXT,
    "research_group" TEXT,
    "research_interests" TEXT,
    "skills" TEXT,
    "bio_zh" TEXT,
    "bio_en" TEXT,
    "more_about_me" TEXT,
    "interests_hobbies" TEXT,
    "avatar_url" TEXT,
    "office_location" TEXT,
    "office_hours" TEXT,
    "pronouns" TEXT,
    "position" TEXT,
    "phone_number" TEXT,
    "personal_website" TEXT,
    "github_username" TEXT,
    "linkedin_url" TEXT,
    "google_scholar_id" TEXT,
    "cv_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role_name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "favorite_emojis" TEXT,
    "start_date" DATETIME,
    "graduation_details" TEXT,
    "recruiting_status" TEXT,
    "is_profile_public" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "supervisor_id" TEXT,
    CONSTRAINT "Member_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("avatar_url", "bio_en", "bio_zh", "createdAt", "cv_url", "email", "enrollment_year", "favorite_emojis", "google_scholar_id", "graduation_details", "id", "interests_hobbies", "is_profile_public", "linkedin_url", "major", "more_about_me", "name_en", "name_zh", "office_hours", "office_location", "personal_website", "phone_number", "pronouns", "recruiting_status", "research_group", "research_interests", "skills", "start_date", "status", "supervisor_id", "title_en", "title_zh", "updatedAt") SELECT "avatar_url", "bio_en", "bio_zh", "createdAt", "cv_url", "email", "enrollment_year", "favorite_emojis", "google_scholar_id", "graduation_details", "id", "interests_hobbies", "is_profile_public", "linkedin_url", "major", "more_about_me", "name_en", "name_zh", "office_hours", "office_location", "personal_website", "phone_number", "pronouns", "recruiting_status", "research_group", "research_interests", "skills", "start_date", "status", "supervisor_id", "title_en", "title_zh", "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_username_key" ON "Member"("username");
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE INDEX "Member_display_order_idx" ON "Member"("display_order");
CREATE INDEX "Member_is_active_idx" ON "Member"("is_active");
CREATE INDEX "Member_role_name_idx" ON "Member"("role_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Sponsorship_member_id_idx" ON "Sponsorship"("member_id");

-- CreateIndex
CREATE INDEX "Sponsorship_display_order_idx" ON "Sponsorship"("display_order");

-- CreateIndex
CREATE INDEX "AcademicService_display_order_idx" ON "AcademicService"("display_order");
