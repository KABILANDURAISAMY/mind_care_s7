const Counsellor = require("../models/Counsellor");
const Student = require("../models/Student");
const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");
const Assessment = require("../models/Assessment");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");
const { ensureDefaultSlots } = require("../utils/defaultSlots");
const { isValidDate, isValidTime, combineDateTime } = require("../utils/validators");
const { sendEmail } = require("../services/emailService");

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

    const slotEndTime = combineDateTime(date, endTime);
    if (slotEndTime <= new Date()) {
      return res.status(400).json({ message: "Cannot create an availability slot in the past." });
    }

    const slot = await Availability.create({
      counsellorId: counsellor._id,
      date,
      startTime,
      endTime,
      status: "available",
    });

    const displayName = counsellor.title ? `${counsellor.title} ${counsellor.name}` : counsellor.name;

    // Create a structured notification for students about the new slot
    await Notification.create({
      type: "new_slot",
      counsellorId: counsellor._id,
      counsellorName: displayName,
      targetRole: "student",
      title: "New Appointment Slot Available",
      message: `${displayName} has added a new counselling slot.\nDate: ${date}\nTime: ${startTime} – ${endTime}\nYou can now book this slot.`,
      date,
      time: `${startTime} – ${endTime}`,
      readBy: [],
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

    // Generate default slots for this counsellor for the next 7 days
    await ensureDefaultSlots(counsellor._id);

    const now = new Date();

    // Fetch non-removed and non-cancelled slots for this counsellor
    const slots = await Availability.find({
      counsellorId: counsellor._id,
      status: { $nin: ["removed", "cancelled"] },
    }).sort({ date: 1, startTime: 1 });

    // Clean up / expire past slots without deleting them (status: expired)
    const expiredSlotIds = [];
    const validSlots = [];

    slots.forEach((s) => {
      const slotEndTime = combineDateTime(s.date, s.endTime || s.startTime);
      if (slotEndTime <= now && s.status === "available") {
        expiredSlotIds.push(s._id);
      } else if (s.status !== "expired") {
        validSlots.push(s);
      }
    });

    if (expiredSlotIds.length > 0) {
      await Availability.updateMany({ _id: { $in: expiredSlotIds } }, { $set: { status: "expired" } });
    }

    // Fetch active bookings to attach student details to booked slots
    const activeAppts = await Appointment.find({
      counsellorId: counsellor._id,
      status: { $in: ["Booked", "Completed"] },
    });

    const apptMap = new Map();
    activeAppts.forEach((a) => {
      if (a.availabilityId) {
        apptMap.set(a.availabilityId.toString(), {
          studentName: a.studentName,
          department: a.department,
          rollNumber: a.rollNumber,
          issue: a.issue,
          appointmentId: a._id,
        });
      }
    });

    const slotsWithDetails = validSlots.map((s) => {
      const obj = s.toObject();
      if (s.status === "booked" && apptMap.has(s._id.toString())) {
        obj.bookingDetails = apptMap.get(s._id.toString());
      }
      return obj;
    });

    res.json(slotsWithDetails);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/counsellor/availability/:id
const removeAvailability = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const slot = await Availability.findOne({ _id: req.params.id, counsellorId: counsellor._id });
    if (!slot) return res.status(404).json({ message: "Slot not found." });

    if (slot.status === "booked") {
      const appt = await Appointment.findOne({ availabilityId: slot._id, status: { $in: ["Booked", "Completed"] } });
      const studentInfo = appt ? `${appt.studentName} (${appt.department})` : "a student";
      return res.status(400).json({
        message: `This slot is currently booked by ${studentInfo}. Please use the Appointments page to cancel the session and notify the student with an apology message.`,
      });
    }

    slot.status = "removed";
    await slot.save();

    res.json({ message: "Availability slot removed successfully." });
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

// PUT /api/counsellor/appointments/:id/link
const updateMeetingLink = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const { meetingLink } = req.body;
    const appointment = await Appointment.findOne({ _id: req.params.id, counsellorId: counsellor._id });
    
    if (!appointment) return res.status(404).json({ message: "Appointment not found." });
    if (appointment.appointmentType !== "Online") {
      return res.status(400).json({ message: "Can only add meeting link to Online appointments." });
    }

    appointment.meetingLink = meetingLink || "";
    await appointment.save();

    res.json({ message: "Meeting link updated.", appointment });
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

/* ------------------------------------------------------------------ */
/* Counsellor Cancellation & Student Feedback                         */
/* ------------------------------------------------------------------ */

// PUT /api/counsellor/appointments/:id/cancel
const cancelCounsellorAppointment = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const appointment = await Appointment.findOne({ _id: req.params.id, counsellorId: counsellor._id });
    if (!appointment) return res.status(404).json({ message: "Appointment not found." });

    if (appointment.status !== "Booked") {
      return res.status(400).json({ message: `Appointment is already ${appointment.status.toLowerCase()}.` });
    }

    const { reason } = req.body;
    const apologyNote = reason || "Counsellor was unavailable due to an unexpected scheduling conflict. We sincerely apologize for the inconvenience.";

    appointment.status = "Cancelled";
    appointment.cancelledBy = "counsellor";
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = apologyNote;
    await appointment.save();

    // Release slot so alternate booking or open status is handled
    await Availability.findByIdAndUpdate(appointment.availabilityId, { $set: { status: "available" } });

    // Create a targeted Notification entry for the student
    await Notification.create({
      studentId: appointment.studentId,
      counsellorId: counsellor._id,
      counsellorName: counsellor.name,
      type: "cancellation",
      title: "Appointment Cancelled by Counsellor",
      message: `Your session on ${appointment.date} at ${appointment.time} with ${counsellor.name} was cancelled by the counsellor.`,
      apologyNote: apologyNote,
      date: appointment.date,
      time: appointment.time,
      readBy: [],
    });

    const student = await Student.findById(appointment.studentId);
    if (student) {
      sendEmail({
        to: student.email,
        subject: "Appointment Cancelled - Alternate Slots Available",
        text: `Dear ${student.name},\n\nWe sincerely apologize! Your appointment scheduled for ${appointment.date} at ${appointment.time} with ${counsellor.name} has been cancelled.\n\nReason/Note: ${apologyNote}\n\nPlease visit your MindCare dashboard to book an alternate session.\n\nWarm regards,\nMindCare Team`,
      });
    }

    res.json({ message: "Appointment cancelled successfully and student notified.", appointment });
  } catch (error) {
    next(error);
  }
};

// GET /api/counsellor/feedbacks
const getCounsellorFeedbacks = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const feedbacks = await Feedback.find({ counsellorId: counsellor._id })
      .populate("studentId", "name department rollNumber")
      .populate("appointmentId", "date time issue")
      .sort({ createdAt: -1 });

    const total = feedbacks.length;
    const averageRating = total
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1)
      : "0.0";

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((f) => {
      if (ratingCounts[f.rating] !== undefined) ratingCounts[f.rating]++;
    });

    res.json({
      feedbacks,
      totalFeedbacks: total,
      averageRating: parseFloat(averageRating),
      ratingCounts,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/counsellor/notifications
const getCounsellorNotifications = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    const notifications = await Notification.find({
      counsellorId: counsellor._id,
      type: "low_wellness_alert",
      readByCounsellor: false,
      readBy: { $nin: [req.user._id, counsellor._id] },
    })
      .populate("studentId", "name department rollNumber email")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// PUT /api/counsellor/notifications/:id/dismiss
const dismissCounsellorNotification = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.user._id });
    if (!counsellor) return res.status(404).json({ message: "Counsellor profile not found." });

    await Notification.findOneAndUpdate(
      { _id: req.params.id, counsellorId: counsellor._id },
      {
        $set: { readByCounsellor: true },
        $addToSet: { readBy: [req.user._id, counsellor._id] },
      }
    );

    res.json({ message: "Notification dismissed." });
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
  updateMeetingLink,
  listStudents,
  getStudentDetail,
  getStudentAppointmentHistory,
  getStudentAssessments,
  cancelCounsellorAppointment,
  getCounsellorFeedbacks,
  getCounsellorNotifications,
  dismissCounsellorNotification,
};
