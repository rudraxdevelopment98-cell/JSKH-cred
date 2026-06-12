import { verifyAccessToken } from '../crypto/tokens.js';
import { query } from '../db/pool.js';
import { ApiError } from './ApiError.js';

/**
 * Require a valid access token. Loads the user and attaches it to req.user.
 */
export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized();
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const { rows } = await query(
      'SELECT id, email, phone, display_name, role, two_factor_enabled, status FROM users WHERE id = $1',
      [payload.sub],
    );
    const user = rows[0];
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (user.status === 'suspended') throw ApiError.forbidden('Account suspended');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
