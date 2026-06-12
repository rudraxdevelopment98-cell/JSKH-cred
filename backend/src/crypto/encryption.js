import crypto from 'node:crypto';
import env from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit nonce recommended for GCM

/**
 * Resolve the 32-byte AES-256 key from the configured value.
 * Accepts base64 or hex; otherwise treats the string as raw UTF-8 and
 * derives a 32-byte key via SHA-256.
 */
function resolveKey() {
  const raw = env.vaultEncryptionKey;
  for (const encoding of ['base64', 'hex']) {
    const buf = Buffer.from(raw, encoding);
    if (buf.length === 32) return buf;
  }
  return crypto.createHash('sha256').update(raw).digest();
}

const KEY = resolveKey();

/**
 * Encrypt a JSON-serializable value with AES-256-GCM.
 * Returns a self-describing object suitable for storing in JSONB.
 */
export function encryptJson(value) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: 1,
    alg: ALGORITHM,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: ciphertext.toString('base64'),
  };
}

/**
 * Decrypt a payload produced by {@link encryptJson}.
 */
export function decryptJson(payload) {
  if (!payload || payload.alg !== ALGORITHM) {
    throw new Error('Unsupported or missing encrypted payload');
  }
  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const data = Buffer.from(payload.data, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}

/** SHA-256 hash helper (used for hashing refresh tokens before storage). */
export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
