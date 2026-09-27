import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../../config/s3';
import { env } from '../../config/env';
import { GetObjectCommand } from '@aws-sdk/client-s3';

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

export async function buildDisplayUrl(imageKey: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: imageKey });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function getImageBuffer(imageKey: string): Promise<Buffer> {
  const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: imageKey });
  const response = await s3Client.send(command);
  const byteArray = await response.Body!.transformToByteArray();
  return Buffer.from(byteArray);
}