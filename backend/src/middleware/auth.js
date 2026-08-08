const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Verifies the JWT from the Authorization header (Bearer token).
 * Attaches the authenticated user (without password) to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists');
    }

    req.user = user; // { _id, name, email, role, ... }
    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized, token invalid or expired');
  }
});

/**
 * Restricts route access to specific roles.
 * Usage: authorize('admin') or authorize('admin', 'tenant')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user?.role}' is not authorized to access this resource`);
    }
    next();
  };
};

module.exports = { protect, authorize };
