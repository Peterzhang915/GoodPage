-- CreateTable
CREATE TABLE "homepage_section_meta" (
    "section_id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "introduction" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "homepage_news" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "interest_points" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "homepage_projects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "project_url" TEXT,
    "type" TEXT NOT NULL DEFAULT 'MAIN',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "leader_id" TEXT,
    CONSTRAINT "homepage_projects_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "homepage_teaching" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_title" TEXT NOT NULL,
    "details" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "homepage_news_display_order_idx" ON "homepage_news"("display_order");

-- CreateIndex
CREATE INDEX "interest_points_display_order_idx" ON "interest_points"("display_order");

-- CreateIndex
CREATE INDEX "homepage_projects_type_display_order_idx" ON "homepage_projects"("type", "display_order");

-- CreateIndex
CREATE INDEX "homepage_projects_leader_id_idx" ON "homepage_projects"("leader_id");

-- CreateIndex
CREATE INDEX "homepage_teaching_display_order_idx" ON "homepage_teaching"("display_order");
