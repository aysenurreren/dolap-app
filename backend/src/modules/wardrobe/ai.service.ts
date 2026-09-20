import { ClothingCategory, ClothingSeason } from '@prisma/client';

interface ClassificationResult {
  category: ClothingCategory;
  color: string;
  seasons: ClothingSeason[];
  categoryConfidence: number;
  colorConfidence: number;
  seasonsConfidence: number;
}

export async function classifyImage(imageKey: string): Promise<ClassificationResult> {
  // STUB — Modül 4'te gerçek Python AI servisine HTTP isteğiyle değiştirilecek
  return {
    category: 'TSHIRT',
    color: '#CCCCCC',
    seasons: ['YAZ'],
    categoryConfidence: 0.5,
    colorConfidence: 0.5,
    seasonsConfidence: 0.5,
  };
}