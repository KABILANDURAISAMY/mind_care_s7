const Counsellor = require("../models/Counsellor");
const Student = require("../models/Student");
const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");
const Assessment = require("../models/Assessment");
const { isValidDate, isValidTime } = require("../utils/validators");

/* ------------------------------------------------------------------ */
/* Profile & dashboard                                                 */
/* ------------------------------------------------------------------ */

// GET /api/counsellor/profile
const getProfile = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });
    res.json(counsellor);
  } catch (error) {
    next(error);
  }
};

// GET /api/counsellor/dashboard - overview cards (spec section 15)
const getDashboardSummary = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const today = new Date().toISOString().slice(0, 10);

    const [todayCount, upcomingCount, completedCount, cancelledCount, distinctStudents] = await Promise.all([
      Appointment.countDocuments({ counsellorId: counsellor._id, date: today, status: "Booked" }),
      Appointment.countDocuments({ counsellorId: counsellor._id, date: { $gte: today }, status: "Booked" }),
      Appointment.countDocuments({ counsellorId: counsellor._id, status: "Completed" }),
      Appointment.countDocuments({ counsellorId: counsellor._id, status: "Cancelled" }),
      Appointment.distinct("studentId", { counsellorId: counsellor._id }),
    ]);

    res.json({
      todayAppointments: todayCount,
      upcomingAppointments: upcomingCount,
      completedSessions: completedCount,
      cancelledSessions: cancelledCount,
      totalStudents: distinctStudents.length,
    });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Availability management                                             */
/* ------------------------------------------------------------------ */

// POST /api/counsellor/availability
const addAvailability = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const { date, startTime, endTime } = req.body;

    if (!isValidDate(date) || !isValidTime(startTime) || !isValidTime(endTime)) {
      return res.status(400).json({ message: "A valid date, start time, and end time are required." });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ message: "Start time must be before end time." });
    }

    const slot = await Availability.create({
      counsellorId: counsellor._id,
      date,
      startTime,
      endTime,
      status: "available",
    });

    res.status(201).json({ message: "Availability slot created.", slot });
  } catch (error) {
    next(error);
  }
};

// GET /api/counsellor/availability
const listAvailability = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const slots = await Availability.find({ counsellorId: counsellor._id }).sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/counsellor/availability/:id
// Only unused (still "available") slots may be removed - a booked slot
// must be cancelled through the appointment flow instead.
const removeAvailability = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const slot = await Availability.findOne({ _id: req.params.id, counsellorId: counsellor._id });
    if (!slot) return res.status(404).json({ message: "Slot not found." });

    if (slot.status === "booked") {
      return res.status(400).json({ message: "This slot is already booked and cannot be removed." });
    }

    await slot.deleteOne();
    res.json({ message: "Availability slot removed." });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

// GET /api/counsellor/appointments
const getAppointments = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const appointments = await Appointment.find({ counsellorId: counsellor._id }).sort({ date: -1, time: -1 });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

// PUT /api/counsellor/appointments/:id/status  { status: "Completed" | "Missed" | "Cancelled" }
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const { status } = req.body;
    if (!["Completed", "Missed", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Status must be Completed, Missed, or Cancelled." });
    }

    const appointment = await Appointment.findOne({ _id: req.params.id, counsellorId: counsellor._id });
    if (!appointment) return res.status(404).json({ message: "Appointment not found." });

    const previousStatus = appointment.status;
    appointment.status = status;
    if (status === "Cancelled") appointment.cancelledAt = new Date();
    await appointment.save();

    // Releasing the slot only makes sense if it was actively holding a booking.
    if (status === "Cancelled" && previousStatus === "Booked") {
      await Availability.findByIdAndUpdate(appointment.availabilityId, { $set: { status: "available" } });
    }

    res.json({ message: "Appointment status updated.", appointment });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Students & history                                                  */
/* ------------------------------------------------------------------ */

// GET /api/counsellor/students - distinct students who have booked this counsellor
const listStudents = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const studentIds = await Appointment.distinct("studentId", { counsellorId: counsellor._id });
    const students = await Student.find({ _id: { $in: studentIds } }).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    next(error);
  }
};

// GET /api/counsellor/student/:id
const getStudentDetail = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found." });
    res.json(student);
  } catch (error) {
    next(error);
  }
};

// GET /api/counsellor/student/:id/history - appointment history with this counsellor
const getStudentAppointmentHistory = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const history = await Appointment.find({
      studentId: req.params.id,
      counsellorId: counsellor._id,
    }).sort({ date: -1, time: -1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

// GET /api/counsellor/student/:id/assessments - wellness score trend
const getStudentAssessments = async (req, res, next) => {
  try {
    const assessments = await Assessment.find({ studentId: req.params.id }).sort({ date: -1 }).limit(90);

    let trend = "Not enough data";
    if (assessments.length >= 2) {
      const diff = assessments[0].percentage - assessments[1].percentage;
      trend = diff > 3 ? "Improving" : diff < -3 ? "Declining" : "Stable";
    }

    res.json({ assessments, trend });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getDashboardSummary,
  addAvailability,
  listAvailability,
  removeAvailability,
  getAppointments,
  updateAppointmentStatus,
  listStudents,
  getStudentDetail,
  getStudentAppointmentHistory,
  getStudentAssessments,
};
