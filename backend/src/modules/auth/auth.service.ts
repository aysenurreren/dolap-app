import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import {
  hashPassword,
  generateVerificationCode,
  hashVerificationCode,
} from '../../shared/utils/crypto.util';
import { RegisterInput } from './auth.validation';

const CODE_EXPIRY_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 60;

const GENERIC_SUCCESS_MESSAGE = 'Doğrulama kodu email adresine gönderildi.';

export async function registerUser(input: RegisterInput, ipAddress: string | null) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    include: { emailVerification: true },
  });

  if (existingUser && existingUser.emailVerified) {
    return { message: GENERIC_SUCCESS_MESSAGE };
  }

  if (existingUser && !existingUser.emailVerified) {
    return resendVerificationCode(existingUser.id, existingUser.emailVerification, ipAddress);
  }

  return createNewUser(input, ipAddress);
}

async function createNewUser(input: RegisterInput, ipAddress: string | null) {
  const passwordHash = await hashPassword(input.password);
  const code = generateVerificationCode();
  const codeHash = hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          displayName: input.displayName,
        },
      });

      await tx.emailVerification.create({
        data: {
          userId: user.id,
          codeHash,
          expiresAt,
          ipAddress,
        },
      });
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { message: GENERIC_SUCCESS_MESSAGE };
    }
    throw error;
  }

  console.log(`[DEV] ${input.email} için doğrulama kodu: ${code}`);

  return { message: GENERIC_SUCCESS_MESSAGE };
}

async function resendVerificationCode(
  userId: string,
  existingVerification: { windowStartedAt: Date } | null,
  ipAddress: string | null
) {
  if (existingVerification) {
    const secondsSinceLastSend =
      (Date.now() - existingVerification.windowStartedAt.getTime()) / 1000;

    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      return { message: GENERIC_SUCCESS_MESSAGE };
    }
  }

  const code = generateVerificationCode();
  const codeHash = hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

  await prisma.emailVerification.upsert({
    where: { userId },
    update: { codeHash, attempts: 0, expiresAt, windowStartedAt: new Date(), ipAddress },
    create: { userId, codeHash, expiresAt, ipAddress },
  });

  console.log(`[DEV] (resend) doğrulama kodu: ${code}`);

  return { message: GENERIC_SUCCESS_MESSAGE };
}