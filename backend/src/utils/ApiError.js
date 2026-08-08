/**
 * Custom error class carrying an HTTP statusCode.
 * Thrown from controllers; caught by asyncHandler -> errorHandler middleware.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
