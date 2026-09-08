const mongoose = require("mongoose");

const wellnessFAQSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    advice: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WellnessFAQ", wellnessFAQSchema);
