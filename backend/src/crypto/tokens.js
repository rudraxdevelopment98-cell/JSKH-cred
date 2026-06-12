import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, type: 'access' },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessTtl },
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.jwt.accessSecret);
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return payload;
}

/**
 * Refresh tokens are opaque random strings. We store only their SHA-256 hash
 * in the sessions table so a database leak cannot be replayed.
 */
export function generateRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

/** Parse a TTL like "30d" / "15m" into milliseconds. */
export function ttlToMs(ttl) {
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return 0;
  const [, n, unit] = match;
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return parseInt(n, 10) * mult;
}
