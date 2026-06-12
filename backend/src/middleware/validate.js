import { ApiError } from './ApiError.js';

/**
 * Validate `req[source]` against a Zod schema and replace it with the parsed
 * (and coerced) value. Throws a 400 ApiError on failure.
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const detail = result.error.issues
        .map((i) => `${i.path.join('.') || source}: ${i.message}`)
        .join('; ');
      return next(ApiError.badRequest(detail, 'validation_error'));
    }
    req[source] = result.data;
    next();
  };
}
