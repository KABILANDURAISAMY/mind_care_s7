const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: "Counsellor", required: true },
    availabilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Availability", required: true },

    // Denormalized snapshot fields so appointment history remains
    // readable even if a student's profile details change later.
    studentName: { type: String, required: true },
    department: { type: String, required: true },
    rollNumber: { type: String, required: true },

    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm

    issue: { type: String, required: true },
    details: { type: String, default: "" },

    status: {
      type: String,
      enum: ["Booked", "Completed", "Cancelled", "Missed"],
      default: "Booked",
    },

    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: "" },
    cancelledBy: { type: String, enum: ["student", "counsellor", null], default: null },
  },
  { timestamps: true }
);

// The critical anti-double-booking constraint: one active appointment
// per counsellor per date/time slot. Cancelled appointments are excluded
// via the partial filter so the slot can be re-booked by someone else.
appointmentSchema.index(
  { counsellorId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["Booked", "Completed"] } },
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
