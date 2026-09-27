import api from './axiosInstance';
import type { ClothingItem, ClothingCategory, ClothingSeason } from '../types/clothing.types';

export async function getWardrobeItems(): Promise<ClothingItem[]> {
  const response = await api.get('/wardrobe');
  return response.data;
}

export async function requestUploadUrl(fileName: string, contentType: string, fileSize: number) {
  const response = await api.post('/wardrobe/upload-url', { fileName, contentType, fileSize });
  return response.data as { uploadUrl: string; imageKey: string };
}

export async function confirmUpload(imageKey: string): Promise<ClothingItem> {
  const response = await api.post('/wardrobe', { imageKey });
  return response.data;
}

export async function updateClothingItem(
  id: string,
  data: Partial<{ category: ClothingCategory; color: string; seasons: ClothingSeason[] }>
): Promise<ClothingItem> {
  const response = await api.patch(`/wardrobe/${id}`, data);
  return response.data;
}

export async function deleteClothingItem(id: string): Promise<void> {
  await api.delete(`/wardrobe/${id}`);
}

export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
}