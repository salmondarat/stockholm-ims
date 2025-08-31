-- Create categories table
CREATE TABLE "categories" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "parent_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "idx_categories_parent_id" ON "categories"("parent_id");

ALTER TABLE "categories"
  ADD CONSTRAINT "categories_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "categories"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Extend items with price, options, and category
ALTER TABLE "items"
  ADD COLUMN "price" DECIMAL(10,2),
  ADD COLUMN "options" JSONB,
  ADD COLUMN "category_id" UUID;

ALTER TABLE "items"
  ADD CONSTRAINT "items_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
