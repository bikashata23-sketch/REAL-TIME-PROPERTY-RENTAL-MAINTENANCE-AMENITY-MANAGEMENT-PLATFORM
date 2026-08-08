/**
 * Centralized error-handling middleware.
 * MUST be registered LAST in app.js (after all routes).
 * Every controller will call next(error) to funnel errors here —
 * this avoids duplicated try/catch error-formatting logic everywhere.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Stack trace only in development — never leak internals in production
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

/**
 * Handles requests to undefined routes (404).
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
