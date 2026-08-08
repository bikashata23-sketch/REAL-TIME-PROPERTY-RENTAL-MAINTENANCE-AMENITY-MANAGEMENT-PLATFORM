const jwt = require('jsonwebtoken');

/**
 * Signs a JWT containing the user id and role.
 * Role is embedded so authorization middleware never needs an extra DB hit.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
