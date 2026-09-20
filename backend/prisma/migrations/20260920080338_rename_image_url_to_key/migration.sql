/*
  Warnings:

  - You are about to drop the column `image_url` on the `clothing_items` table. All the data in the column will be lost.
  - Added the required column `image_key` to the `clothing_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clothing_items" DROP COLUMN "image_url",
ADD COLUMN     "image_key" TEXT NOT NULL;
