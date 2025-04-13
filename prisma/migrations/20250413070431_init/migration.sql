/*
  Warnings:

  - You are about to drop the `_PublicationAuthors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `joined_date` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `left_date` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Member` table. All the data in the column will be lost.
  - You are about to drop the column `website_url` on the `Member` table. All the data in the column will be lost.
  - The primary key for the `Publication` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bibtex_entry` on the `Publication` table. All the data in the column will be lost.
  - You are about to drop the column `raw_authors` on the `Publication` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Publication` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Publication` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Publication` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Made the column `year` on table `Publication` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "_PublicationAuthors_B_index";

-- DropIndex
DROP INDEX "_PublicationAuthors_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_PublicationAuthors";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Education" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT,
    "school" TEXT NOT NULL,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "thesis_title" TEXT,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Education_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Award" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT,
    "year" INTEGER,
    "award_type" TEXT,
    "description" TEXT,
    "link_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Award_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT,
    "start_year" INTEGER,
    "end_year" INTEGER,
    "url" TEXT,
    "funding_source" TEXT,
    "logo_url" TEXT,
    "tags" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "project_id" INTEGER NOT NULL,
    "member_id" TEXT NOT NULL,
    "role" TEXT,

    PRIMARY KEY ("project_id", "member_id"),
    CONSTRAINT "ProjectMember_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectMember_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Teaching" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "course_code" TEXT,
    "course_title" TEXT NOT NULL,
    "semester" TEXT,
    "year" INTEGER,
    "role" TEXT NOT NULL DEFAULT 'Instructor',
    "university" TEXT,
    "description_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Teaching_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Presentation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "event_name" TEXT,
    "conference_url" TEXT,
    "location" TEXT,
    "year" INTEGER,
    "url" TEXT,
    "is_invited" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Presentation_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SoftwareDataset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SOFTWARE',
    "repository_url" TEXT,
    "project_url" TEXT,
    "license" TEXT,
    "version" TEXT,
    "status" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SoftwareDataset_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Patent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "patent_number" TEXT,
    "inventors_string" TEXT,
    "issue_date" TEXT,
    "status" TEXT,
    "url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Patent_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AcademicService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "year" INTEGER,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AcademicService_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "News" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "related_publication_id" INTEGER,
    "related_member_id" TEXT,
    CONSTRAINT "News_related_publication_id_fkey" FOREIGN KEY ("related_publication_id") REFERENCES "Publication" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "News_related_member_id_fkey" FOREIGN KEY ("related_member_id") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublicationAuthor" (
    "publication_id" INTEGER NOT NULL,
    "member_id" TEXT NOT NULL,
    "author_order" INTEGER NOT NULL,
    "is_corresponding_author" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("publication_id", "member_id"),
    CONSTRAINT "PublicationAuthor_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "Publication" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublicationAuthor_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "name_zh" TEXT,
    "status" TEXT NOT NULL,
    "enrollment_year" INTEGER,
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
    "pronouns" TEXT,
    "email" TEXT,
    "phone_number" TEXT,
    "personal_website" TEXT,
    "cv_url" TEXT,
    "github_url" TEXT,
    "linkedin_url" TEXT,
    "google_scholar_id" TEXT,
    "dblp_id" TEXT,
    "semantic_scholar_id" TEXT,
    "orcid_id" TEXT,
    "start_date" DATETIME,
    "graduation_details" TEXT,
    "recruiting_status" TEXT,
    "is_profile_public" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "supervisor_id" TEXT,
    CONSTRAINT "Member_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("avatar_url", "createdAt", "email", "id", "name_en", "name_zh", "research_interests", "status", "updatedAt") SELECT "avatar_url", "createdAt", "email", "id", "name_en", "name_zh", "research_interests", "status", "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
CREATE UNIQUE INDEX "Member_id_key" ON "Member"("id");
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
CREATE TABLE "new_Publication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "year" INTEGER NOT NULL,
    "ccf_rank" TEXT,
    "doi_url" TEXT,
    "pdf_url" TEXT,
    "abstract" TEXT,
    "keywords" TEXT,
    "type" TEXT DEFAULT 'CONFERENCE',
    "bibtex" TEXT,
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
INSERT INTO "new_Publication" ("abstract", "ccf_rank", "createdAt", "doi_url", "id", "keywords", "pdf_url", "title", "updatedAt", "venue", "year") SELECT "abstract", "ccf_rank", "createdAt", "doi_url", "id", "keywords", "pdf_url", "title", "updatedAt", "venue", "year" FROM "Publication";
DROP TABLE "Publication";
ALTER TABLE "new_Publication" RENAME TO "Publication";
CREATE UNIQUE INDEX "Publication_doi_url_key" ON "Publication"("doi_url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Education_member_id_idx" ON "Education"("member_id");

-- CreateIndex
CREATE INDEX "Award_member_id_idx" ON "Award"("member_id");

-- CreateIndex
CREATE INDEX "ProjectMember_member_id_idx" ON "ProjectMember"("member_id");

-- CreateIndex
CREATE INDEX "Teaching_member_id_idx" ON "Teaching"("member_id");

-- CreateIndex
CREATE INDEX "Presentation_member_id_idx" ON "Presentation"("member_id");

-- CreateIndex
CREATE INDEX "SoftwareDataset_member_id_idx" ON "SoftwareDataset"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "Patent_patent_number_key" ON "Patent"("patent_number");

-- CreateIndex
CREATE INDEX "Patent_member_id_idx" ON "Patent"("member_id");

-- CreateIndex
CREATE INDEX "AcademicService_member_id_idx" ON "AcademicService"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "News_related_publication_id_key" ON "News"("related_publication_id");

-- CreateIndex
CREATE INDEX "PublicationAuthor_member_id_idx" ON "PublicationAuthor"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "PublicationAuthor_publication_id_author_order_key" ON "PublicationAuthor"("publication_id", "author_order");
