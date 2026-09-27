import type { ClothingCategory, ClothingSeason } from '../types/clothing.types';

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  TSHIRT: 'Tişört',
  SHIRT: 'Gömlek',
  SWEATER: 'Kazak',
  JACKET: 'Ceket',
  PANTS: 'Pantolon',
  SHORTS: 'Şort',
  SKIRT: 'Etek',
  DRESS: 'Elbise',
  SCARF: 'Eşarp',
  JEWELRY: 'Takı',
  ACCESSORY: 'Aksesuar',
  SHOES: 'Ayakkabı',
};

export const SEASON_LABELS: Record<ClothingSeason, string> = {
  YAZ: 'Yaz',
  KIS: 'Kış',
  ILKBAHAR: 'İlkbahar',
  SONBAHAR: 'Sonbahar',
};