/**
 * An error with an associated HTTP status and stable error code.
 * Thrown anywhere in a handler/service; turned into a JSON response by
 * the global error handler.
 */
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }

  static badRequest(message, code = 'bad_request') {
    return new ApiError(400, code, message);
  }
  static unauthorized(message = 'Authentication required', code = 'unauthorized') {
    return new ApiError(401, code, message);
  }
  static forbidden(message = 'Forbidden', code = 'forbidden') {
    return new ApiError(403, code, message);
  }
  static notFound(message = 'Not found', code = 'not_found') {
    return new ApiError(404, code, message);
  }
  static conflict(message, code = 'conflict') {
    return new ApiError(409, code, message);
  }
}
