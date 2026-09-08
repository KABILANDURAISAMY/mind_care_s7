/**
 * Restricts a route to one or more roles.
 * Usage: router.get("/x", protect, requireRole("counsellor"), handler)
 * This is what stops students reaching counsellor-only APIs and vice versa.
 */
const Student = require("../models/Student");
const Counsellor = require("../models/Counsellor");

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

const attachRoleProfile = async (req, res, next) => {
  if (!req.user) return next();
  try {
    if (req.user.role === "student") {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) req.studentId = student._id;
    } else if (req.user.role === "counsellor") {
      const counsellor = await Counsellor.findOne({ userId: req.user._id });
      if (counsellor) req.counsellorId = counsellor._id;
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireRole, attachRoleProfile };
