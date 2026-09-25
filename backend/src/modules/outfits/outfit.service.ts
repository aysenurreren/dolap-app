export class OutfitError extends Error {}
import prisma from '../../config/prisma';
import { getColorHarmonyScore } from '../../shared/utils/color.util';
import { ClothingCategory, ClothingSeason, ClothingItem } from '@prisma/client';

const TOP_CATEGORIES: ClothingCategory[] = ['TSHIRT', 'SHIRT', 'SWEATER', 'JACKET'];
const BOTTOM_CATEGORIES: ClothingCategory[] = ['PANTS', 'SHORTS', 'SKIRT'];
const ONE_PIECE_CATEGORIES: ClothingCategory[] = ['DRESS'];

function getCurrentSeason(): ClothingSeason {
  const month = new Date().getMonth() + 1;
  if (month === 12 || month <= 2) return 'KIS';
  if (month <= 5) return 'ILKBAHAR';
  if (month <= 8) return 'YAZ';
  return 'SONBAHAR';
}

interface OutfitCandidate {
  items: ClothingItem[];
  score: number;
}

function scoreOutfit(items: ClothingItem[]): number {
  let totalScore = 0;
  let pairCount = 0;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      totalScore += getColorHarmonyScore(items[i].color, items[j].color);
      pairCount++;
    }
  }

  return pairCount === 0 ? 0 : totalScore / pairCount;
}

interface SuggestionResult {
  suggestions: OutfitCandidate[];
  message?: string;
}

export async function generateOutfitSuggestions(userId: string): Promise<SuggestionResult> {
  const currentSeason = getCurrentSeason();

  const allItems = await prisma.clothingItem.findMany({
    where: {
      userId,
      deletedAt: null,
      seasons: { has: currentSeason },
    },
  });

  const tops = allItems.filter((item) => TOP_CATEGORIES.includes(item.category));
  const bottoms = allItems.filter((item) => BOTTOM_CATEGORIES.includes(item.category));
  const shoes = allItems.filter((item) => item.category === 'SHOES');
  const dresses = allItems.filter((item) => ONE_PIECE_CATEGORIES.includes(item.category));

  if (allItems.length === 0) {
    return { suggestions: [], message: 'Bu mevsime uygun hiç kıyafetiniz yok. Dolabınıza kıyafet ekleyin.' };
  }

  if (shoes.length === 0) {
    return { suggestions: [], message: 'Kombin önerisi için en az bir ayakkabı eklemelisiniz.' };
  }

  if (tops.length === 0 && dresses.length === 0) {
    return { suggestions: [], message: 'Kombin önerisi için en az bir üst giyim veya elbise eklemelisiniz.' };
  }

  if (bottoms.length === 0 && dresses.length === 0) {
    return { suggestions: [], message: 'Kombin önerisi için en az bir alt giyim veya elbise eklemelisiniz.' };
  }

  const candidates: OutfitCandidate[] = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const items = [top, bottom, shoe];
        candidates.push({ items, score: scoreOutfit(items) });
      }
    }
  }

  for (const dress of dresses) {
    for (const shoe of shoes) {
      const items = [dress, shoe];
      candidates.push({ items, score: scoreOutfit(items) });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  return { suggestions: candidates.slice(0, 3) };
}
export async function getUserOutfits(userId: string) {
  return prisma.outfit.findMany({
    where: { userId },
    include: { items: { include: { clothingItem: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function saveOutfit(userId: string, clothingItemIds: string[]) {
  const ownedItemsCount = await prisma.clothingItem.count({
    where: {
      id: { in: clothingItemIds },
      userId,
      deletedAt: null,
    },
  });

  if (ownedItemsCount !== clothingItemIds.length) {
    throw new OutfitError('Geçersiz kıyafet seçimi');
  }

  const outfit = await prisma.outfit.create({
    data: {
      userId,
      items: {
        create: clothingItemIds.map((id) => ({ clothingItemId: id })),
      },
    },
    include: {
      items: { include: { clothingItem: true } },
    },
  });

  return outfit;
}