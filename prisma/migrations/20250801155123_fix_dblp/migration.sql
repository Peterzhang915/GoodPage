/*
  Warnings:

  - You are about to drop the column `dblp_id` on the `Member` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "research_statement_zh" TEXT,
    "research_statement_en" TEXT,
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
    "dblp_url" TEXT,
    "orcid_id" TEXT,
    "cv_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "role_name" TEXT,
    "username" TEXT,
    "password_hash" TEXT,
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
INSERT INTO "new_Member" ("avatar_url", "bio_en", "bio_zh", "createdAt", "cv_url", "dblp_url", "display_order", "email", "enrollment_year", "favorite_emojis", "github_username", "google_scholar_id", "graduation_details", "graduation_year", "id", "interests_hobbies", "is_active", "is_profile_public", "linkedin_url", "major", "more_about_me", "name_en", "name_zh", "office_hours", "office_location", "orcid_id", "password_hash", "personal_website", "phone_number", "position", "pronouns", "recruiting_status", "research_group", "research_interests", "research_statement_en", "research_statement_zh", "role_name", "skills", "start_date", "status", "supervisor_id", "title_en", "title_zh", "updatedAt", "username") SELECT "avatar_url", "bio_en", "bio_zh", "createdAt", "cv_url", "dblp_url", "display_order", "email", "enrollment_year", "favorite_emojis", "github_username", "google_scholar_id", "graduation_details", "graduation_year", "id", "interests_hobbies", "is_active", "is_profile_public", "linkedin_url", "major", "more_about_me", "name_en", "name_zh", "office_hours", "office_location", "orcid_id", "password_hash", "personal_website", "phone_number", "position", "pronouns", "recruiting_status", "research_group", "research_interests", "research_statement_en", "research_statement_zh", "role_name", "skills", "start_date", "status", "supervisor_id", "title_en", "title_zh", "updatedAt", "username" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_username_key" ON "Member"("username");
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE INDEX "Member_display_order_idx" ON "Member"("display_order");
CREATE INDEX "Member_is_active_idx" ON "Member"("is_active");
CREATE INDEX "Member_role_name_idx" ON "Member"("role_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
