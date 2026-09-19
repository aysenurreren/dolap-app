import crypto from 'crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import { generateRefreshToken } from '../../shared/utils/jwt.util';
import { AuthError } from '../../shared/utils/errors';
import { generateAccessToken } from '../../shared/utils/jwt.util';
import prisma from '../../config/prisma';

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export async function createSession(
  userId: string,
  ipAddress: string | null,
  userAgent: string | null,
  client: PrismaClient | Prisma.TransactionClient,
  existingFamilyId?: string
) {
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const familyId = existingFamilyId ?? crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await client.session.create({
    data: { userId, familyId, refreshTokenHash, ipAddress, userAgent, expiresAt },
  });

  return refreshToken;
}

export async function refreshSession(
  rawRefreshToken: string,
  ipAddress: string | null,
  userAgent: string | null
) {
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  const session = await prisma.session.findUnique({
    where: { refreshTokenHash: tokenHash },
    include: { user: true },
  });

  if (!session) {
    throw new AuthError('Geçersiz oturum');
  }

  if (session.revokedAt) {
    throw new AuthError('Oturum iptal edilmiş');
  }

  if (session.usedAt) {
    await prisma.session.updateMany({
      where: { familyId: session.familyId },
      data: { revokedAt: new Date() },
    });

    console.log(`[DEV] ${session.user.email} için güvenlik uyarısı: token reuse tespit edildi, tüm oturumlar iptal edildi`);

    throw new AuthError('Güvenlik ihlali tespit edildi, tüm oturumlar sonlandırıldı');
  }

  if (session.expiresAt < new Date()) {
    throw new AuthError('Oturum süresi dolmuş');
  }

  const newRefreshToken = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.session.update({
      where: { id: session.id },
      data: { usedAt: new Date() },
    });

    return createSession(session.userId, ipAddress, userAgent, tx, session.familyId);
  });

  const accessToken = generateAccessToken({
    userId: session.user.id,
    email: session.user.email,
  });

  return { accessToken, refreshToken: newRefreshToken };
}