const jwt = require("jsonwebtoken");

/**
 * Issues a signed JWT carrying the user's id and role.
 * The role is embedded so route middleware can enforce
 * role-based access without an extra database lookup.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
