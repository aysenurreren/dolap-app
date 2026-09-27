import type { ClothingItem } from './clothing.types';

export interface OutfitItemLink {
  outfitId: string;
  clothingItemId: string;
  clothingItem: ClothingItem;
}

export interface Outfit {
  id: string;
  userId: string;
  createdAt: string;
  items: OutfitItemLink[];
}