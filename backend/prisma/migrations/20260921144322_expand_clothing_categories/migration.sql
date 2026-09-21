-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ClothingCategory" ADD VALUE 'SHIRT';
ALTER TYPE "ClothingCategory" ADD VALUE 'SHORTS';
ALTER TYPE "ClothingCategory" ADD VALUE 'SKIRT';
ALTER TYPE "ClothingCategory" ADD VALUE 'SCARF';
ALTER TYPE "ClothingCategory" ADD VALUE 'JEWELRY';
