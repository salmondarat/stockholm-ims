-- Add column for media ordering
ALTER TABLE "item_media"
  ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

