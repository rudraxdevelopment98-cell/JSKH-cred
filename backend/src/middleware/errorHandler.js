import env from '../config/env.js';
import { ApiError } from './ApiError.js';

export function notFoundHandler(_req, _res, next) {
  next(ApiError.notFound('Route not found', 'route_not_found'));
}

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
  }

  // Unique-violation from Postgres → 409
  if (err.code === '23505') {
    return res.status(409).json({
      error: { code: 'conflict', message: 'Resource already exists' },
    });
  }

  if (!env.isTest) console.error(err);
  return res.status(500).json({
    error: {
      code: 'internal_error',
      message: env.isProd ? 'Internal server error' : err.message,
    },
  });
}
