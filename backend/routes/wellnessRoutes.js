const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getCategories,
  getQuestionsByCategory,
  getQuestionById,
} = require("../controllers/wellnessController");

const router = express.Router();

router.get("/categories", protect, getCategories);
router.get("/questions/:category", protect, getQuestionsByCategory);
router.get("/question/:id", protect, getQuestionById);

module.exports = router;
