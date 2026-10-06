const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: "Counsellor", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

// Enforce one feedback per completed appointment
feedbackSchema.index(
  { appointmentId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { appointmentId: { $ne: null } } }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
