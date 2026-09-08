const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
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
router.put("/appointments/:id/link", ctrl.updateMeetingLink);
router.put("/appointments/:id/cancel", ctrl.cancelCounsellorAppointment);
router.get("/feedbacks", ctrl.getCounsellorFeedbacks);

router.get("/students", ctrl.listStudents);
router.get("/student/:id", ctrl.getStudentDetail);
router.get("/student/:id/history", ctrl.getStudentAppointmentHistory);
router.get("/student/:id/assessments", ctrl.getStudentAssessments);

router.get("/notifications", ctrl.getCounsellorNotifications);
router.put("/notifications/:id/dismiss", ctrl.dismissCounsellorNotification);

module.exports = router;
