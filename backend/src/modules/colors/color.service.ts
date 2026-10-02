import prisma from '../../config/prisma';
import { buildDisplayUrl } from '../wardrobe/s3.service';
import { hexToHSL, generateSchemeHues, hueDistance } from '../../shared/utils/color.util';
import type { ColorScheme } from '../../shared/utils/color.util';

export class ColorError extends Error {}

export async function getWardrobeColorWheel(userId: string) {
  const items = await prisma.clothingItem.findMany({
    where: { userId, deletedAt: null },
  });

  return Promise.all(
    items.map(async (item) => {
      const hsl = hexToHSL(item.color);
      return {
        id: item.id,
        category: item.category,
        color: item.color,
        hue: hsl.h,
        saturation: hsl.s,
        imageUrl: await buildDisplayUrl(item.imageKey),
      };
    })
  );
}

export async function getColorScheme(userId: string, itemId: string, scheme: ColorScheme) {
  const baseItem = await prisma.clothingItem.findFirst({
    where: { id: itemId, userId, deletedAt: null },
  });

  if (!baseItem) {
    throw new ColorError('Kıyafet bulunamadı');
  }

  const otherItems = await prisma.clothingItem.findMany({
    where: { userId, deletedAt: null, id: { not: itemId } },
  });

  const baseHsl = hexToHSL(baseItem.color);
  const targetHues = generateSchemeHues(baseHsl.h, scheme);

  const otherSlots = await Promise.all(
    targetHues.map(async (targetHue) => {
      let closestItem = null;
      let closestHsl = null;
      let closestDistance = Infinity;

      for (const item of otherItems) {
        const itemHsl = hexToHSL(item.color);
        const distance = hueDistance(itemHsl.h, targetHue);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestItem = item;
          closestHsl = itemHsl;
        }
      }

      return {
        targetHue,
        item:
          closestItem && closestHsl
            ? {
                ...closestItem,
                hue: closestHsl.h,
                saturation: closestHsl.s,
                imageUrl: await buildDisplayUrl(closestItem.imageKey),
              }
            : null,
      };
    })
  );

  return {
    scheme,
    baseItem: {
      ...baseItem,
      hue: baseHsl.h,
      saturation: baseHsl.s,
      imageUrl: await buildDisplayUrl(baseItem.imageKey),
    },
    otherSlots,
  };
}