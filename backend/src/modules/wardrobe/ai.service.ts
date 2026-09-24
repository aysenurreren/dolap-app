import { env } from '../../config/env';
import { getImageBuffer } from './s3.service';
import { ClothingCategory, ClothingSeason } from '@prisma/client';

export class AiServiceError extends Error {}

interface ClassificationResult {
  category: ClothingCategory;
  color: string;
  seasons: ClothingSeason[];
  categoryConfidence: number;
  colorConfidence: number;
  seasonsConfidence: number;
}

export async function classifyImage(imageKey: string): Promise<ClassificationResult> {
  const imageBuffer = await getImageBuffer(imageKey);

  const formData = new FormData();
  const blob = new Blob([imageBuffer as unknown as BlobPart]);
  formData.append('file', blob, 'image.jpg');

  let response: Response;
  try {
    response = await fetch(`${env.AI_SERVICE_URL}/classify`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    throw new AiServiceError('AI servisine ulaşılamadı');
  }

  if (!response.ok) {
    throw new AiServiceError('AI servisi bir hata döndürdü');
  }

  const data = await response.json();

  return {
    category: data.category as ClothingCategory,
    color: data.color,
    seasons: data.seasons as ClothingSeason[],
    categoryConfidence: data.categoryConfidence,
    colorConfidence: data.colorConfidence,
    seasonsConfidence: data.seasonsConfidence,
  };
}