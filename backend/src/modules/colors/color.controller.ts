import { Request, Response } from 'express';
import { getWardrobeColorWheel, getColorScheme, ColorError } from './color.service';
import type { ColorScheme } from '../../shared/utils/color.util';

const VALID_SCHEMES: ColorScheme[] = ['complementary', 'analogous', 'triadic', 'splitComplementary', 'tetradic'];

export async function colorWheelController(req: Request, res: Response) {
  try {
    const wheel = await getWardrobeColorWheel(req.user!.userId);
    return res.status(200).json(wheel);
  } catch (error) {
    console.error('Renk çarkı hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

export async function colorSchemeController(req: Request, res: Response) {
  const itemId = req.params.itemId as string;
  const scheme = req.query.type as ColorScheme;

  if (!VALID_SCHEMES.includes(scheme)) {
    return res.status(400).json({ error: 'Geçersiz şema tipi' });
  }

  try {
    const result = await getColorScheme(req.user!.userId, itemId, scheme);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ColorError) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Renk şeması hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}