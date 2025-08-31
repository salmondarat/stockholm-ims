-- CreateTable: item_media
CREATE TABLE "item_media" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "content_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_media_pkey" PRIMARY KEY ("id")
);

-- Index for lookups
CREATE INDEX "idx_item_media_item_id" ON "item_media"("item_id");

-- Foreign key with cascade delete
ALTER TABLE "item_media"
  ADD CONSTRAINT "item_media_item_id_fkey"
  FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

