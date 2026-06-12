import env from '../../config/env.js';
import { query, withTransaction } from '../../db/pool.js';
import { hashPassword, verifyPassword } from '../../crypto/password.js';
import { sha256 } from '../../crypto/encryption.js';
import {
  signAccessToken,
  generateRefreshToken,
  ttlToMs,
} from '../../crypto/tokens.js';
import { ApiError } from '../../middleware/ApiError.js';
import { logActivity } from '../activity/activity.service.js';

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    phone: u.phone,
    displayName: u.display_name,
    role: u.role,
    twoFactorEnabled: u.two_factor_enabled,
    status: u.status,
  };
}

async function issueSession(user, { userAgent, ip } = {}) {
  const refreshToken = generateRefreshToken();
  const tokenHash = sha256(refreshToken);
  const expiresAt = new Date(Date.now() + ttlToMs(env.jwt.refreshTtl));

  await query(
    `INSERT INTO sessions (user_id, token_hash, user_agent, ip, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [user.id, tokenHash, userAgent ?? null, ip ?? null, expiresAt],
  );

  return {
    accessToken: signAccessToken(user),
    refreshToken,
    user: publicUser(user),
  };
}

export async function register({ email, password, displayName }, ctx = {}) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) {
    throw ApiError.conflict('Email already registered', 'email_taken');
  }

  const passwordHash = await hashPassword(password);
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, display_name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, passwordHash, displayName ?? null],
  );
  const user = rows[0];
  await logActivity({ userId: user.id, action: 'login', metadata: { event: 'register' } });
  return issueSession(user, ctx);
}

export async function login({ email, password }, ctx = {}) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  const ok = user && (await verifyPassword(password, user.password_hash));
  if (!ok) throw ApiError.unauthorized('Invalid credentials', 'invalid_credentials');
  if (user.status === 'suspended') throw ApiError.forbidden('Account suspended');

  await logActivity({ userId: user.id, action: 'login', metadata: { event: 'login' } });
  return issueSession(user, ctx);
}

export async function refresh({ refreshToken }, ctx = {}) {
  if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');
  const tokenHash = sha256(refreshToken);

  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT s.*, u.id AS uid, u.role, u.status
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1`,
      [tokenHash],
    );
    const session = rows[0];
    if (!session || session.revoked || new Date(session.expires_at) < new Date()) {
      throw ApiError.unauthorized('Invalid or expired session', 'invalid_session');
    }

    // Rotate: revoke the old session and issue a new one.
    await client.query('UPDATE sessions SET revoked = TRUE WHERE id = $1', [session.id]);

    const newToken = generateRefreshToken();
    const newHash = sha256(newToken);
    const expiresAt = new Date(Date.now() + ttlToMs(env.jwt.refreshTtl));
    await client.query(
      `INSERT INTO sessions (user_id, token_hash, user_agent, ip, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [session.user_id, newHash, ctx.userAgent ?? null, ctx.ip ?? null, expiresAt],
    );

    const user = { id: session.uid, role: session.role };
    return { accessToken: signAccessToken(user), refreshToken: newToken };
  });
}

export async function logout({ refreshToken }) {
  if (!refreshToken) return;
  await query('UPDATE sessions SET revoked = TRUE WHERE token_hash = $1', [
    sha256(refreshToken),
  ]);
}

export async function listSessions(userId) {
  const { rows } = await query(
    `SELECT id, user_agent, ip, revoked, created_at, expires_at
     FROM sessions WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}

export async function revokeSession(userId, sessionId) {
  const { rowCount } = await query(
    'UPDATE sessions SET revoked = TRUE WHERE id = $1 AND user_id = $2',
    [sessionId, userId],
  );
  if (!rowCount) throw ApiError.notFound('Session not found');
}

export { publicUser };
