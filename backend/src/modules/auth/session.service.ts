import crypto from 'crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import { generateRefreshToken } from '../../shared/utils/jwt.util';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export async function createSession(
  userId: string,
  ipAddress: string | null,
  userAgent: string | null,
  client: PrismaClient | Prisma.TransactionClient
) {
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const familyId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  );

  await client.session.create({
    data: { userId, familyId, refreshTokenHash, ipAddress, userAgent, expiresAt },
  });

  return refreshToken;
}