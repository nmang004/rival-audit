import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function uploadScreenshot(
  buffer: Buffer,
  auditId: string,
  type: 'desktop' | 'mobile'
): Promise<string> {
  await ensureUploadDir();

  const filename = `${auditId}-${type}-${Date.now()}.png`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(filepath, buffer);

  // Return public URL
  return `/uploads/${filename}`;
}

export async function uploadFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  await ensureUploadDir();

  const uniqueFilename = `${Date.now()}-${filename}`;
  const filepath = path.join(UPLOAD_DIR, uniqueFilename);

  await fs.writeFile(filepath, buffer);

  return `/uploads/${uniqueFilename}`;
}

/**
 * Upload Excel file to storage
 * Returns public URL for download
 */
export async function uploadExcel(
  buffer: Buffer,
  filename: string,
  auditId: string
): Promise<string> {
  await ensureUploadDir();

  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueFilename = `${auditId}-${Date.now()}-${sanitizedFilename}`;
  const filepath = path.join(UPLOAD_DIR, uniqueFilename);

  await fs.writeFile(filepath, buffer);

  console.log('[Storage] Excel file uploaded:', uniqueFilename);

  // Return public URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/uploads/${uniqueFilename}`;
}

// For production, you would use AWS S3:
/*
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadScreenshot(
  buffer: Buffer,
  auditId: string,
  type: 'desktop' | 'mobile'
): Promise<string> {
  const filename = `screenshots/${auditId}-${type}-${Date.now()}.png`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: filename,
      Body: buffer,
      ContentType: 'image/png',
    })
  );

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
}
*/
