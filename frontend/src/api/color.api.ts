import api from './axiosInstance';
import type { ColorWheelItem, SchemeResult, ColorScheme } from '../types/color.types';

export async function getColorWheel(): Promise<ColorWheelItem[]> {
  const response = await api.get('/colors/wheel');
  return response.data;
}

export async function getColorScheme(itemId: string, scheme: ColorScheme): Promise<SchemeResult> {
  const response = await api.get(`/colors/schemes/${itemId}`, { params: { type: scheme } });
  return response.data;
}