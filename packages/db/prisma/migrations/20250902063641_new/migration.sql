-- CreateTable
CREATE TABLE "item_variants" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "sku" TEXT,
    "qty" INTEGER NOT NULL DEFAULT 0,
    "attrs" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_item_variants_item_id" ON "item_variants"("item_id");

-- AddForeignKey
ALTER TABLE "item_variants" ADD CONSTRAINT "item_variants_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
