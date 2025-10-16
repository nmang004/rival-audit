import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Use AES-256-GCM for encryption
const ALGORITHM = 'aes-256-gcm';

// IMPORTANT: Set ENCRYPTION_KEY environment variable in production
if (!process.env.ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('ENCRYPTION_KEY environment variable is required in production');
}

const KEY = process.env.ENCRYPTION_KEY || 'default-32-character-secret-key!'; // Development fallback only
const KEY_BUFFER = Buffer.from(KEY.padEnd(32, '0').slice(0, 32));

/**
 * Encrypts a string value
 * @param text - The text to encrypt
 * @returns Encrypted string in format: iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
  if (!text) return text;

  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY_BUFFER, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return iv:authTag:encrypted format
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted string
 * @param encryptedText - The encrypted text in format: iv:authTag:encryptedData
 * @returns Decrypted string
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;

  try {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(ALGORITHM, KEY_BUFFER, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return as-is if decryption fails
  }
}

/**
 * Masks an API key for display
 * @param apiKey - The full API key
 * @returns Masked key showing only last 4 characters
 */
export function maskApiKey(apiKey: string | null | undefined): string | null {
  if (!apiKey || apiKey.length < 8) return null;

  const last4 = apiKey.slice(-4);
  return `${'•'.repeat(12)}${last4}`;
}
