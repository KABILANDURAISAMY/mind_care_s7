const express = require("express");
const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/studentController");

const router = express.Router();

// Every route below requires a valid student JWT.
router.use(protect, requireRole("student"));

router.get("/profile", ctrl.getProfile);

router.get("/counsellors", ctrl.listCounsellors);
router.get("/availability", ctrl.getAvailability);

router.post("/book", ctrl.bookAppointment);
router.get("/appointments", ctrl.getAppointments);
router.put("/cancel/:id", ctrl.cancelAppointment);

router.get("/assessment/questions", ctrl.getAssessmentQuestions);
router.post("/assessment", ctrl.submitAssessment);
router.get("/assessment-history", ctrl.getAssessmentHistory);

module.exports = router;
