import { Request, Response } from 'express';
import {
  requestUploadUrlSchema,
  confirmUploadSchema,
  updateClothingItemSchema,
} from './wardrobe.validation';
import {
  requestUploadUrl,
  createClothingItem,
  getUserClothingItems,
  getClothingItemById,
  updateClothingItem,
  softDeleteClothingItem,
  WardrobeError,
} from './wardrobe.service';

export async function requestUploadUrlController(req: Request, res: Response) {
  const validationResult = requestUploadUrlSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: 'Geçersiz veri', details: validationResult.error.flatten().fieldErrors });
  }

  try {
    const result = await requestUploadUrl(req.user!.userId, validationResult.data);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Upload URL hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

export async function confirmUploadController(req: Request, res: Response) {
  const validationResult = confirmUploadSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: 'Geçersiz veri' });
  }

  try {
    const clothingItem = await createClothingItem(req.user!.userId, validationResult.data.imageKey);
    return res.status(201).json(clothingItem);
  } catch (error) {
    if (error instanceof WardrobeError) {
      return res.status(403).json({ error: error.message });
    }
    console.error('Kıyafet oluşturma hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

export async function listClothingItemsController(req: Request, res: Response) {
  try {
    const items = await getUserClothingItems(req.user!.userId);
    return res.status(200).json(items);
  } catch (error) {
    console.error('Listeleme hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

export async function getClothingItemController(req: Request, res: Response) {
  const itemId = req.params.id as string;

  try {
    const item = await getClothingItemById(req.user!.userId, itemId);
    return res.status(200).json(item);
  } catch (error) {
    if (error instanceof WardrobeError) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Getirme hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

export async function updateClothingItemController(req: Request, res: Response) {
  const itemId = req.params.id as string;

  const validationResult = updateClothingItemSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: 'Geçersiz veri', details: validationResult.error.flatten().fieldErrors });
  }

  try {
    const item = await updateClothingItem(req.user!.userId, itemId, validationResult.data);
    return res.status(200).json(item);
  } catch (error) {
    if (error instanceof WardrobeError) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Güncelleme hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

export async function deleteClothingItemController(req: Request, res: Response) {
  const itemId = req.params.id as string;

  try {
    await softDeleteClothingItem(req.user!.userId, itemId);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof WardrobeError) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Silme hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}