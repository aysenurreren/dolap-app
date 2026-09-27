export type ClothingCategory =
  | 'TSHIRT'
  | 'SHIRT'
  | 'SWEATER'
  | 'JACKET'
  | 'PANTS'
  | 'SHORTS'
  | 'SKIRT'
  | 'DRESS'
  | 'SCARF'
  | 'JEWELRY'
  | 'ACCESSORY'
  | 'SHOES';

export type ClothingSeason = 'YAZ' | 'KIS' | 'ILKBAHAR' | 'SONBAHAR';

export interface ClothingItem {
  id: string;
  userId: string;
  imageKey: string;
  imageUrl: string;
  category: ClothingCategory;
  color: string;
  seasons: ClothingSeason[];
  fabric: string | null;
  brand: string | null;
  categoryConfidence: number | null;
  colorConfidence: number | null;
  seasonsConfidence: number | null;
  aiOriginalSuggestion: unknown;
  lastWornAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}