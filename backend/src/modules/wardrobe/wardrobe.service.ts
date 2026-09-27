import prisma from '../../config/prisma';
import { generateUploadUrl, buildDisplayUrl } from './s3.service';
import { classifyImage } from './ai.service';
import { RequestUploadUrlInput, UpdateClothingItemInput  } from './wardrobe.validation';
import { Prisma } from '@prisma/client';

export class WardrobeError extends Error {}

export async function requestUploadUrl(userId: string, input: RequestUploadUrlInput) {
  return generateUploadUrl(userId, input.contentType, input.fileSize);
}

export async function createClothingItem(userId: string, imageKey: string) {
  if (!imageKey.startsWith(`users/${userId}/`)) {
    throw new WardrobeError('Bu görsel size ait değil');
  }

  const classification = await classifyImage(imageKey);

  const clothingItem = await prisma.clothingItem.create({
    data: {
      userId,
      imageKey,
      category: classification.category,
      color: classification.color,
      seasons: classification.seasons,
      categoryConfidence: classification.categoryConfidence,
      colorConfidence: classification.colorConfidence,
      seasonsConfidence: classification.seasonsConfidence,
      aiOriginalSuggestion: classification as unknown as Prisma.InputJsonValue,
    },
  });

  return { ...clothingItem, imageUrl: await buildDisplayUrl(clothingItem.imageKey) };
}

async function findOwnedClothingItem(userId: string, itemId: string) {
  const item = await prisma.clothingItem.findFirst({
    where: { id: itemId, userId, deletedAt: null },
  });

  if (!item) {
    throw new WardrobeError('Kıyafet bulunamadı');
  }

  return item;
}

export async function getUserClothingItems(userId: string) {
  const items = await prisma.clothingItem.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  return Promise.all(
    items.map(async (item) => ({ ...item, imageUrl: await buildDisplayUrl(item.imageKey) }))
  );
}

export async function getClothingItemById(userId: string, itemId: string) {
  const item = await findOwnedClothingItem(userId, itemId);
  return { ...item, imageUrl: await buildDisplayUrl(item.imageKey) };
}

export async function updateClothingItem(
  userId: string,
  itemId: string,
  data: UpdateClothingItemInput
) {
  await findOwnedClothingItem(userId, itemId);

  const updated = await prisma.clothingItem.update({
    where: { id: itemId },
    data,
  });

  return { ...updated, imageUrl: await buildDisplayUrl(updated.imageKey) };
}

export async function softDeleteClothingItem(userId: string, itemId: string) {
  await findOwnedClothingItem(userId, itemId);

  await prisma.clothingItem.update({
    where: { id: itemId },
    data: { deletedAt: new Date() },
  });
}