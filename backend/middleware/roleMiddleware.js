/**
 * Restricts a route to one or more roles.
 * Usage: router.get("/x", protect, requireRole("counsellor"), handler)
 * This is what stops students reaching counsellor-only APIs and vice versa.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This resource is restricted to: ${allowedRoles.join(", ")}.`,
      });
    }
    next();
  };
};

module.exports = requireRole;
