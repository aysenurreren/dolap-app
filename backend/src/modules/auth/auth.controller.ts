import { Request, Response } from 'express';
import { registerSchema, verifyEmailSchema } from './auth.validation';
import { registerUser, verifyEmail, AuthError } from './auth.service';
import { env } from '../../config/env';
import { loginSchema } from './auth.validation';
import { loginUser } from './auth.service';

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

export async function verifyEmailController(req: Request, res: Response) {
  const validationResult = verifyEmailSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Geçersiz veri',
      details: validationResult.error.flatten().fieldErrors,
    });
  }

  const ipAddress = req.ip ?? null;
  const userAgent = req.get('user-agent') ?? null;

  try {
    const result = await verifyEmail(validationResult.data, ipAddress, userAgent);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Verify email hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası, lütfen tekrar deneyin' });
  }
}

export async function loginController(req: Request, res: Response) {
  const validationResult = loginSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: 'Geçersiz veri',
      details: validationResult.error.flatten().fieldErrors,
    });
  }

  const ipAddress = req.ip ?? null;
  const userAgent = req.get('user-agent') ?? null;

  try {
    const result = await loginUser(validationResult.data, ipAddress, userAgent);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken: result.accessToken, user: result.user });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(401).json({ error: error.message });
    }
    console.error('Login hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası, lütfen tekrar deneyin' });
  }
}