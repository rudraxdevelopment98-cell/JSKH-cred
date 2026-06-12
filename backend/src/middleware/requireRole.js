import { ApiError } from './ApiError.js';

/**
 * Restrict a route to one or more global roles.
 * Must run after requireAuth.
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient role'));
    }
    next();
  };
}
