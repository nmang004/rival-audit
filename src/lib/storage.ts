import { promises as fs } from 'fs';
import path from 'path';

// Use /tmp directory in production (Vercel serverless), public/uploads in dev
const isProduction = process.env.NODE_ENV === 'production';
const UPLOAD_DIR = isProduction
  ? '/tmp/uploads'
  : path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Upload screenshot to storage
 * In production (Vercel): Returns base64 data URI (filesystem is read-only)
 * In development: Saves to public/uploads and returns public URL
 */
export async function uploadScreenshot(
  buffer: Buffer,
  auditId: string,
  type: 'desktop' | 'mobile'
): Promise<string> {
  if (isProduction) {
    // In production (Vercel serverless), return base64 data URI
    // This avoids filesystem issues and works with Prisma's string fields
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } else {
    // In development, save to filesystem for easier debugging
    await ensureUploadDir();

    const filename = `${auditId}-${type}-${Date.now()}.png`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await fs.writeFile(filepath, buffer);

    // Return public URL
    return `/uploads/${filename}`;
  }
}

export async function uploadFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  if (isProduction) {
    // In production, save to /tmp (writable in Vercel)
    await ensureUploadDir();
    const uniqueFilename = `${Date.now()}-${filename}`;
    const filepath = path.join(UPLOAD_DIR, uniqueFilename);
    await fs.writeFile(filepath, buffer);

    // Return base64 data URI for production
    const base64 = buffer.toString('base64');
    const mimeType = filename.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';
    return `data:${mimeType};base64,${base64}`;
  } else {
    // In development, save to public/uploads
    await ensureUploadDir();
    const uniqueFilename = `${Date.now()}-${filename}`;
    const filepath = path.join(UPLOAD_DIR, uniqueFilename);
    await fs.writeFile(filepath, buffer);
    return `/uploads/${uniqueFilename}`;
  }
}

/**
 * Upload Excel file to storage
 * Returns download URL (public URL in dev, data URI in production)
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

  if (isProduction) {
    // Return base64 data URI for production (Vercel serverless)
    const base64 = buffer.toString('base64');
    return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
  } else {
    // Return public URL for development
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${appUrl}/uploads/${uniqueFilename}`;
  }
}

/**
 * Upload PDF report to storage
 * Returns download URL (public URL in dev, data URI in production)
 */
export async function uploadPDF(
  buffer: Buffer,
  filename: string,
  reportId: string
): Promise<string> {
  await ensureUploadDir();

  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueFilename = `${reportId}-${Date.now()}-${sanitizedFilename}`;
  const filepath = path.join(UPLOAD_DIR, uniqueFilename);

  await fs.writeFile(filepath, buffer);

  console.log('[Storage] PDF file uploaded:', uniqueFilename);

  if (isProduction) {
    // Return base64 data URI for production (Vercel serverless)
    const base64 = buffer.toString('base64');
    return `data:application/pdf;base64,${base64}`;
  } else {
    // Return public URL for development
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${appUrl}/uploads/${uniqueFilename}`;
  }
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
