const mongoose = require("mongoose");

/**
 * One row per student per calendar day.
 * responses holds the raw 1-5 answers to the 10 wellness questions,
 * totalScore is their sum (max 50), percentage is the normalized 0-100 score.
 */
const assessmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    responses: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => arr.length === 10 && arr.every((n) => n >= 1 && n <= 5),
        message: "Assessment must contain exactly 10 answers, each between 1 and 5.",
      },
    },
    totalScore: { type: Number, required: true, min: 0, max: 50 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Enforces "one assessment per student per day" at the database level.
assessmentSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Assessment", assessmentSchema);
