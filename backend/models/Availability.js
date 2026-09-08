const mongoose = require("mongoose");

/**
 * A single bookable slot created by a counsellor.
 * status transitions: available -> booked -> available (on cancellation)
 */
const availabilitySchema = new mongoose.Schema(
  {
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: "Counsellor", required: true },
    date: { type: String, required: true }, // stored as YYYY-MM-DD for simple, unambiguous comparison
    startTime: { type: String, required: true }, // stored as HH:mm (24hr)
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "booked", "completed", "expired", "cancelled", "removed"],
      default: "available",
    },
  },
  { timestamps: true }
);

// A counsellor can never have two identical slots on the same date.
availabilitySchema.index({ counsellorId: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model("Availability", availabilitySchema);
