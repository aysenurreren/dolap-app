export type ColorScheme = 'complementary' | 'analogous' | 'triadic' | 'splitComplementary' | 'tetradic';

export interface ColorWheelItem {
  id: string;
  category: string;
  color: string;
  hue: number;
  saturation: number;
  imageUrl: string;
}

export interface SchemeSlot {
  targetHue: number;
  item: ColorWheelItem | null;
}

export interface SchemeResult {
  scheme: ColorScheme;
  baseItem: ColorWheelItem;
  otherSlots: SchemeSlot[];
}