import { z } from 'zod';
import { ClothingCategory, ClothingSeason } from '@prisma/client';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const requestUploadUrlSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  fileSize: z.number().positive().max(MAX_FILE_SIZE_BYTES, "Dosya 5MB'tan büyük olamaz"),
});
export type RequestUploadUrlInput = z.infer<typeof requestUploadUrlSchema>;

export const confirmUploadSchema = z.object({
  imageKey: z.string().min(1),
});
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;

export const updateClothingItemSchema = z.object({
  category: z.nativeEnum(ClothingCategory).optional(),
  color: z.string().optional(),
  seasons: z.array(z.nativeEnum(ClothingSeason)).optional(),
  fabric: z.string().optional(),
  brand: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'En az bir alan gönderilmeli' });

export type UpdateClothingItemInput = z.infer<typeof updateClothingItemSchema>;