-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "name_zh" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Current',
    "role" TEXT,
    "avatar_url" TEXT,
    "website_url" TEXT,
    "research_interests" TEXT,
    "joined_date" DATETIME,
    "left_date" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "year" INTEGER,
    "ccf_rank" TEXT,
    "abstract" TEXT,
    "keywords" TEXT,
    "doi_url" TEXT,
    "pdf_url" TEXT,
    "bibtex_entry" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_PublicationAuthors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PublicationAuthors_A_fkey" FOREIGN KEY ("A") REFERENCES "Member" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PublicationAuthors_B_fkey" FOREIGN KEY ("B") REFERENCES "Publication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_PublicationAuthors_AB_unique" ON "_PublicationAuthors"("A", "B");

-- CreateIndex
CREATE INDEX "_PublicationAuthors_B_index" ON "_PublicationAuthors"("B");
