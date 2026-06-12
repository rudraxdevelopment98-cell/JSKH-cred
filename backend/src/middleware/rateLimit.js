import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

/** Global limiter applied to all API routes. */
export const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  // Disabled under test to keep integration tests deterministic.
  skip: () => env.isTest,
  message: { error: { code: 'rate_limited', message: 'Too many requests' } },
});

/** Stricter limiter for authentication endpoints. */
export const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { error: { code: 'rate_limited', message: 'Too many attempts' } },
});
