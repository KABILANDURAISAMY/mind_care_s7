const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: "Counsellor", required: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One unique conversation per student-counsellor pair
conversationSchema.index({ studentId: 1, counsellorId: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);
