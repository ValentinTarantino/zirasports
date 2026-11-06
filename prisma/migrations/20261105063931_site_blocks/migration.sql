-- CreateEnum
CREATE TYPE "SiteBlockKind" AS ENUM ('HERO', 'TEXT', 'CATEGORY', 'IMAGE', 'VIDEO', 'NEWS_GRID', 'PROMO');

-- CreateEnum
CREATE TYPE "SiteBlockVariant" AS ENUM ('CARD_1X1', 'CARD_2X1', 'FEATURED_3X2', 'FULL_WIDTH');

-- CreateTable
CREATE TABLE "SiteBlock" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL DEFAULT 'home',
    "kind" "SiteBlockKind" NOT NULL DEFAULT 'TEXT',
    "variant" "SiteBlockVariant" NOT NULL DEFAULT 'CARD_1X1',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteBlock_key_key" ON "SiteBlock"("key");

-- CreateIndex
CREATE INDEX "SiteBlock_pageKey_order_idx" ON "SiteBlock"("pageKey", "order");
