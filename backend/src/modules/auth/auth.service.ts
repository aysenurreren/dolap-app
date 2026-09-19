import { generateAccessToken } from '../../shared/utils/jwt.util';
import { createSession } from './session.service';
import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';
import {
  hashPassword,
  generateVerificationCode,
  hashVerificationCode,
} from '../../shared/utils/crypto.util';
import { RegisterInput } from './auth.validation';
import { comparePassword } from '../../shared/utils/crypto.util';
import { LoginInput } from './auth.validation';
import bcrypt from 'bcrypt';
import { AuthError } from '../../shared/utils/errors';

const DUMMY_PASSWORD_HASH = bcrypt.hashSync('dummy-password-for-timing-safety', 12);
const GENERIC_LOGIN_ERROR = 'Email veya şifre hatalı';

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

export async function resendVerificationCode(
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

const MAX_ATTEMPTS = 5;
const GENERIC_VERIFY_ERROR = 'Kod geçersiz veya süresi dolmuş';

export async function verifyEmail(
  input: { email: string; code: string },
  ipAddress: string | null,
  userAgent: string | null
) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { emailVerification: true },
  });

  if (!user || !user.emailVerification) {
    throw new AuthError(GENERIC_VERIFY_ERROR);
  }

  const verification = user.emailVerification;

  if (verification.expiresAt < new Date()) {
    throw new AuthError(GENERIC_VERIFY_ERROR);
  }

  if (verification.attempts >= MAX_ATTEMPTS) {
    throw new AuthError(GENERIC_VERIFY_ERROR);
  }

  const inputCodeHash = hashVerificationCode(input.code);
  const isCodeCorrect = inputCodeHash === verification.codeHash;

  if (!isCodeCorrect) {
    const updated = await prisma.emailVerification.update({
      where: { userId: user.id },
      data: { attempts: { increment: 1 } },
    });

    if (updated.attempts >= MAX_ATTEMPTS) {
      console.log(`[DEV] ${user.email} için güvenlik uyarısı emaili gönderilecek`);
    }

    throw new AuthError(GENERIC_VERIFY_ERROR);
  }

  const refreshToken = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    await tx.emailVerification.delete({
      where: { userId: user.id },
    });

    return createSession(user.id, ipAddress, userAgent, tx);
  });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, displayName: user.displayName } };
}

export async function loginUser(
  input: LoginInput,
  ipAddress: string | null,
  userAgent: string | null
) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: { emailVerification: true },
  });

  const hashToCompare = user ? user.passwordHash : DUMMY_PASSWORD_HASH;
  const isPasswordCorrect = await comparePassword(input.password, hashToCompare);

  if (!user || !isPasswordCorrect) {
    throw new AuthError(GENERIC_LOGIN_ERROR);
  }

  if (!user.emailVerified) {
    await resendVerificationCode(user.id, user.emailVerification, ipAddress);
    throw new AuthError('Email adresiniz doğrulanmamış. Yeni bir doğrulama kodu gönderildi.');
  }

  const refreshToken = await createSession(user.id, ipAddress, userAgent, prisma);
  const accessToken = generateAccessToken({ userId: user.id, email: user.email });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, displayName: user.displayName },
  };
}