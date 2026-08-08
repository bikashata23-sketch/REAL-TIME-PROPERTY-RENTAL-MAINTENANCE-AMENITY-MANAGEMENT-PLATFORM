/**
 * Wraps async route handlers so any thrown/rejected error
 * is automatically forwarded to next() -> errorHandler middleware.
 * Removes the need for try/catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
