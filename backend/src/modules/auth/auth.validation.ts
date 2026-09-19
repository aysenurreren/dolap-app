import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .email('Geçerli bir email adresi girin'),

  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .max(64, 'Şifre en fazla 64 karakter olabilir')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli'),

  displayName: z
    .string()
    .trim()
    .min(1, 'İsim boş olamaz')
    .max(50, 'İsim en fazla 50 karakter olabilir'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  code: z.string().length(6, 'Kod 6 haneli olmalı').regex(/^\d+$/, 'Kod sadece rakamlardan oluşmalı'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(1, 'Şifre gerekli'),
});

export type LoginInput = z.infer<typeof loginSchema>;