import { Request, Response } from 'express';
import { registerSchema } from './auth.validation';
import { registerUser } from './auth.service';

export async function register(req: Request, res: Response) {
  const validationResult = registerSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Geçersiz veri',
      details: validationResult.error.flatten().fieldErrors,
    });
  }

  const ipAddress = req.ip ?? null;

  try {
    const result = await registerUser(validationResult.data, ipAddress);
    return res.status(201).json(result);
  } catch (error) {
    console.error('Register hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası, lütfen tekrar deneyin' });
  }
}