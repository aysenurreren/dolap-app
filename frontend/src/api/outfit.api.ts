import api from './axiosInstance';
import type { ClothingItem } from '../types/clothing.types';
import type { Outfit } from '../types/outfit.types';

export interface OutfitSuggestion {
  items: ClothingItem[];
  score: number;
}

interface SuggestionsResponse {
  suggestions: OutfitSuggestion[];
  message?: string;
}

export async function getOutfitSuggestions(): Promise<SuggestionsResponse> {
  const response = await api.get('/outfits/suggestions');
  return response.data;
}

export async function saveOutfit(clothingItemIds: string[]) {
  const response = await api.post('/outfits', { clothingItemIds });
  return response.data;
}

export async function getMyOutfits(): Promise<Outfit[]> {
  const response = await api.get('/outfits');
  return response.data;
}