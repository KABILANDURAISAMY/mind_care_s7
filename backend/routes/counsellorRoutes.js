const express = require("express");
const protect = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const ctrl = require("../controllers/counsellorController");

const router = express.Router();

// Every route below requires a valid counsellor JWT.
router.use(protect, requireRole("counsellor"));

router.get("/profile", ctrl.getProfile);
router.get("/dashboard", ctrl.getDashboardSummary);

router.post("/availability", ctrl.addAvailability);
router.get("/availability", ctrl.listAvailability);
router.delete("/availability/:id", ctrl.removeAvailability);

router.get("/appointments", ctrl.getAppointments);
router.put("/appointments/:id/status", ctrl.updateAppointmentStatus);

router.get("/students", ctrl.listStudents);
router.get("/student/:id", ctrl.getStudentDetail);
router.get("/student/:id/history", ctrl.getStudentAppointmentHistory);
router.get("/student/:id/assessments", ctrl.getStudentAssessments);

module.exports = router;
