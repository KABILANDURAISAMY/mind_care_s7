const mongoose = require("mongoose");

/**
 * Base authentication record shared by both students and counsellors.
 * Role-specific profile data lives in the Student / Counsellor collections,
 * linked back here through userId.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false }, // bcrypt hash
    role: { type: String, enum: ["student", "counsellor"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
