import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

const ACCESS_TOKEN_EXPIRY = '15m';

interface AccessTokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(): string {
  return require('crypto').randomBytes(40).toString('hex');
}