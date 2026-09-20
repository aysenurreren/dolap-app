-- CreateEnum
CREATE TYPE "ClothingCategory" AS ENUM ('TSHIRT', 'PANTS', 'JACKET', 'SHOES', 'ACCESSORY', 'DRESS', 'SWEATER');

-- CreateEnum
CREATE TYPE "ClothingSeason" AS ENUM ('YAZ', 'KIS', 'ILKBAHAR', 'SONBAHAR');

-- CreateTable
CREATE TABLE "clothing_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "category" "ClothingCategory" NOT NULL,
    "color" TEXT NOT NULL,
    "seasons" "ClothingSeason"[],
    "fabric" TEXT,
    "brand" TEXT,
    "category_confidence" DOUBLE PRECISION,
    "color_confidence" DOUBLE PRECISION,
    "seasons_confidence" DOUBLE PRECISION,
    "fabric_confidence" DOUBLE PRECISION,
    "ai_original_suggestion" JSONB,
    "last_worn_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clothing_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clothing_items_user_id_idx" ON "clothing_items"("user_id");

-- AddForeignKey
ALTER TABLE "clothing_items" ADD CONSTRAINT "clothing_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
