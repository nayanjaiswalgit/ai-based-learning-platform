-- CreateEnum
CREATE TYPE "ForumCategoryType" AS ENUM ('GENERAL', 'COURSE', 'ORGANIZATION', 'QUESTION', 'ISSUE', 'ANNOUNCEMENT');

-- AlterTable
ALTER TABLE "forum_categories" ADD COLUMN "organization_id" TEXT;
ALTER TABLE "forum_categories" ADD COLUMN "category_type" "ForumCategoryType" NOT NULL DEFAULT 'GENERAL';

-- CreateIndex
CREATE INDEX "forum_categories_organization_id_idx" ON "forum_categories"("organization_id");

-- CreateIndex
CREATE INDEX "forum_categories_category_type_idx" ON "forum_categories"("category_type");
