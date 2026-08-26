const Student = require("../models/Student");
const Counsellor = require("../models/Counsellor");
const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");
const Assessment = require("../models/Assessment");
const Feedback = require("../models/Feedback");
const { ensureDefaultSlots } = require("../utils/defaultSlots");
const { WELLNESS_QUESTIONS } = require("../utils/wellnessQuestions");
const { combineDateTime, isNonEmptyString } = require("../utils/validators");
const { sendEmail, templates } = require("../services/emailService");

const CANCELLATION_WINDOW_MINUTES = 20;

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

// GET /api/student/profile
const getProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found." });
    res.json(student);
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Counsellors & availability                                          */
/* ------------------------------------------------------------------ */

// GET /api/student/counsellors
const listCounsellors = async (req, res, next) => {
  try {
    const counsellors = await Counsellor.find().sort({ name: 1 });
    res.json(counsellors);
  } catch (error) {
    next(error);
  }
};

// GET /api/student/availability?counsellorId=&date=
// Returns only slots that are genuinely still bookable (status: available,
// and not already in the past), implementing "real-time slot availability".
const getAvailability = async (req, res, next) => {
  try {
    const { counsellorId, date } = req.query;
    
    // Ensure default 4 slots exist for counsellors
    await ensureDefaultSlots(counsellorId || null);

    const filter = { status: "available" };
    if (counsellorId) filter.counsellorId = counsellorId;
    if (date) filter.date = date;

    const slots = await Availability.find(filter)
      .populate("counsellorId", "name specialization qualification experience")
      .sort({ date: 1, startTime: 1 });

    const now = new Date();
    const futureSlots = slots.filter((s) => combineDateTime(s.date, s.startTime) > now);

    res.json(futureSlots);
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Booking                                                              */
/* ------------------------------------------------------------------ */

// POST /api/student/book
// Implements every rule from spec section 28: authentication, existence,
// ownership, availability, validity, and both double-booking checks.
const bookAppointment = async (req, res, next) => {
  try {
    const { availabilityId, issue, details } = req.body;

    if (!availabilityId || !isNonEmptyString(issue)) {
      return res.status(400).json({ message: "A counsellor slot and a reason for the visit are required." });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const slot = await Availability.findById(availabilityId);
    if (!slot) return res.status(404).json({ message: "Selected slot no longer exists." });

    if (slot.status !== "available") {
      return res.status(409).json({ message: "This slot has just been booked by someone else. Please choose another." });
    }

    const counsellor = await Counsellor.findById(slot.counsellorId);
    if (!counsellor) return res.status(404).json({ message: "Counsellor not found." });

    const slotDateTime = combineDateTime(slot.date, slot.startTime);
    if (slotDateTime <= new Date()) {
      return res.status(400).json({ message: "This slot is in the past and cannot be booked." });
    }

    // Prevent the same student double-booking themselves at the same date/time
    // with a different counsellor (spec section 29).
    const studentConflict = await Appointment.findOne({
      studentId: student._id,
      date: slot.date,
      time: slot.startTime,
      status: { $in: ["Booked", "Completed"] },
    });
    if (studentConflict) {
      return res.status(409).json({ message: "You already have another appointment at this date and time." });
    }

    // Atomically flip the slot from available -> booked. If two requests race,
    // only the first update (matched by status: "available") succeeds - this
    // is the backend-level guarantee against double-booking a counsellor slot.
    const claimedSlot = await Availability.findOneAndUpdate(
      { _id: slot._id, status: "available" },
      { $set: { status: "booked" } },
      { new: true }
    );
    if (!claimedSlot) {
      return res.status(409).json({ message: "This slot has just been booked by someone else. Please choose another." });
    }

    let appointment;
    try {
      // The unique compound index on (counsellorId, date, time) for active
      // statuses is the final, database-enforced backstop against duplicates.
      appointment = await Appointment.create({
        studentId: student._id,
        counsellorId: slot.counsellorId,
        availabilityId: slot._id,
        studentName: student.name,
        department: student.department,
        rollNumber: student.rollNumber,
        date: slot.date,
        time: slot.startTime,
        issue,
        details: details || "",
        status: "Booked",
      });
    } catch (err) {
      // Roll back the slot claim if appointment creation failed for any reason.
      await Availability.findByIdAndUpdate(slot._id, { $set: { status: "available" } });
      throw err;
    }

    sendEmail({ to: student.email, ...templates.bookingConfirmedForStudent(appointment, counsellor.name) });
    sendEmail({ to: counsellor.email, ...templates.newBookingForCounsellor(appointment) });

    res.status(201).json({ message: "Appointment booked successfully.", appointment });
  } catch (error) {
    next(error);
  }
};

// GET /api/student/appointments
const getAppointments = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const appointments = await Appointment.find({ studentId: student._id })
      .populate("counsellorId", "name specialization")
      .sort({ date: -1, time: -1 });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

// PUT /api/student/cancel/:id
// Enforces the 20-minute cancellation deadline server-side (spec section 13),
// then releases the slot back to "available" (spec section 14).
const cancelAppointment = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const appointment = await Appointment.findOne({ _id: req.params.id, studentId: student._id });
    if (!appointment) return res.status(404).json({ message: "Appointment not found." });

    if (appointment.status !== "Booked") {
      return res.status(400).json({ message: `This appointment is already ${appointment.status.toLowerCase()} and cannot be cancelled.` });
    }

    const appointmentTime = combineDateTime(appointment.date, appointment.time);
    const deadline = new Date(appointmentTime.getTime() - CANCELLATION_WINDOW_MINUTES * 60 * 1000);

    if (new Date() >= deadline) {
      return res.status(400).json({
        message: `Cancellations must be made at least ${CANCELLATION_WINDOW_MINUTES} minutes before the appointment. This appointment can no longer be cancelled online.`,
      });
    }

    appointment.status = "Cancelled";
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = req.body?.reason || "Cancelled by student";
    await appointment.save();

    // Release the slot so other students can book it again.
    await Availability.findByIdAndUpdate(appointment.availabilityId, { $set: { status: "available" } });

    const counsellor = await Counsellor.findById(appointment.counsellorId);
    if (counsellor) {
      sendEmail({ to: counsellor.email, ...templates.cancellationNotice(appointment, "the student") });
    }

    res.json({ message: "Appointment cancelled successfully.", appointment });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Wellness assessment                                                 */
/* ------------------------------------------------------------------ */

// GET /api/student/assessment/questions
const getAssessmentQuestions = (req, res) => {
  res.json(WELLNESS_QUESTIONS);
};

// POST /api/student/assessment
// responses: array of 10 integers (1-5) in question order.
const submitAssessment = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const { responses } = req.body;
    if (!Array.isArray(responses) || responses.length !== WELLNESS_QUESTIONS.length) {
      return res.status(400).json({ message: `Please answer all ${WELLNESS_QUESTIONS.length} questions.` });
    }
    if (responses.some((r) => !Number.isInteger(r) || r < 1 || r > 5)) {
      return res.status(400).json({ message: "Each answer must be a whole number between 1 and 5." });
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, server-local day

    const alreadySubmitted = await Assessment.findOne({ studentId: student._id, date: today });
    if (alreadySubmitted) {
      return res.status(409).json({ message: "You have already completed today's wellness check-in." });
    }

    // Negative-framed questions (anger, stress, loneliness) are inverted so
    // that a higher raw "frequency" answer still lowers the wellness score.
    let totalScore = 0;
    responses.forEach((value, index) => {
      const question = WELLNESS_QUESTIONS[index];
      totalScore += question.positive ? value : 6 - value;
    });

    const percentage = Math.round((totalScore / (WELLNESS_QUESTIONS.length * 5)) * 100);

    const assessment = await Assessment.create({
      studentId: student._id,
      date: today,
      responses,
      totalScore,
      percentage,
    });

    res.status(201).json({ message: "Wellness check-in submitted.", assessment });
  } catch (error) {
    next(error);
  }
};

// GET /api/student/assessment-history
const getAssessmentHistory = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const history = await Assessment.find({ studentId: student._id }).sort({ date: -1 }).limit(90);

    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = history.find((h) => h.date === today) || null;

    const last7 = history.slice(0, 7);
    const weeklyAverage = last7.length
      ? Math.round(last7.reduce((sum, h) => sum + h.percentage, 0) / last7.length)
      : null;

    let trend = "Not enough data";
    if (history.length >= 2) {
      const diff = history[0].percentage - history[1].percentage;
      trend = diff > 3 ? "Improving" : diff < -3 ? "Declining" : "Stable";
    }

    res.json({ history, todayScore: todayEntry ? todayEntry.percentage : null, weeklyAverage, trend });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Session Feedback                                                   */
/* ------------------------------------------------------------------ */

// POST /api/student/feedback
const submitFeedback = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const { appointmentId, rating, comment } = req.body;
    if (!appointmentId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Appointment ID and a valid rating (1-5) are required." });
    }

    const appointment = await Appointment.findOne({ _id: appointmentId, studentId: student._id });
    if (!appointment) return res.status(404).json({ message: "Appointment not found." });

    if (appointment.status !== "Completed") {
      return res.status(400).json({ message: "Feedback can only be submitted for completed sessions." });
    }

    const existing = await Feedback.findOne({ appointmentId });
    if (existing) {
      return res.status(409).json({ message: "Feedback has already been submitted for this session." });
    }

    const feedback = await Feedback.create({
      appointmentId: appointment._id,
      studentId: student._id,
      counsellorId: appointment.counsellorId,
      rating: Number(rating),
      comment: comment || "",
    });

    res.status(201).json({ message: "Thank you for your feedback!", feedback });
  } catch (error) {
    next(error);
  }
};

// GET /api/student/pending-feedback
const getPendingFeedback = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const completedAppts = await Appointment.find({
      studentId: student._id,
      status: "Completed",
    })
      .populate("counsellorId", "name specialization")
      .sort({ date: -1 });

    if (!completedAppts.length) return res.json([]);

    const apptIds = completedAppts.map((a) => a._id);
    const existingFeedbacks = await Feedback.find({ appointmentId: { $in: apptIds } });
    const submittedApptIds = new Set(existingFeedbacks.map((f) => f.appointmentId.toString()));

    const pending = completedAppts.filter((a) => !submittedApptIds.has(a._id.toString()));

    res.json(pending);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  listCounsellors,
  getAvailability,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  getAssessmentQuestions,
  submitAssessment,
  getAssessmentHistory,
  submitFeedback,
  getPendingFeedback,
};
