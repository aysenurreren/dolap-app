import { Request, Response } from 'express';
import { saveOutfitSchema } from './outfit.validation';
import { generateOutfitSuggestions, saveOutfit, getUserOutfits, OutfitError } from './outfit.service';

export async function suggestOutfitsController(req: Request, res: Response) {
  try {
    const suggestions = await generateOutfitSuggestions(req.user!.userId);
    return res.status(200).json(suggestions);
  } catch (error) {
    console.error('Kombin önerisi hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

export async function saveOutfitController(req: Request, res: Response) {
  const validationResult = saveOutfitSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: 'Geçersiz veri', details: validationResult.error.flatten().fieldErrors });
  }

  try {
    const outfit = await saveOutfit(req.user!.userId, validationResult.data.clothingItemIds);
    return res.status(201).json(outfit);
  } catch (error) {
    if (error instanceof OutfitError) {
      return res.status(403).json({ error: error.message });
    }
    console.error('Kombin kaydetme hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

export async function listOutfitsController(req: Request, res: Response) {
  try {
    const outfits = await getUserOutfits(req.user!.userId);
    return res.status(200).json(outfits);
  } catch (error) {
    console.error('Kombin listeleme hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}