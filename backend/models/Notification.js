const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: "Counsellor" },
    counsellorName: { type: String, default: "" },
    targetRole: { type: String, enum: ["student", "counsellor", "all"], default: "student" },
    type: {
      type: String,
      enum: ["new_slot", "appointment_booked", "cancellation", "low_wellness_alert", "appointment_updated", "system"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    apologyNote: { type: String, default: "" },
    score: { type: Number },
    date: { type: String },
    time: { type: String },
    readBy: [{ type: mongoose.Schema.Types.ObjectId }],
    readByCounsellor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

