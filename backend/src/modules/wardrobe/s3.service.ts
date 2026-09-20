import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../../config/s3';
import { env } from '../../config/env';

const UPLOAD_URL_EXPIRY_SECONDS = 300;

export async function generateUploadUrl(userId: string, contentType: string, fileSize: number) {
  const extension = contentType.split('/')[1];
  const imageKey = `users/${userId}/${crypto.randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: imageKey,
    ContentType: contentType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: UPLOAD_URL_EXPIRY_SECONDS });

  return { uploadUrl, imageKey };
}

export function buildDisplayUrl(imageKey: string): string {
  return `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${imageKey}`;
}