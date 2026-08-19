const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  registerStudent,
  loginStudent,
  registerCounsellor,
  loginCounsellor,
} = require("../controllers/authController");

const router = express.Router();

// Basic brute-force protection on login endpoints.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

router.post("/student/register", registerStudent);
router.post("/student/login", loginLimiter, loginStudent);

router.post("/counsellor/register", registerCounsellor);
router.post("/counsellor/login", loginLimiter, loginCounsellor);

module.exports = router;
