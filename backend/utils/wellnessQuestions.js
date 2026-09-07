/**
 * The fixed 10-question daily wellness check-in.
 * Each question is answered on a 1-5 scale, so the maximum
 * obtainable score is 50 (see assessmentController scoring logic).
 */
const WELLNESS_QUESTIONS = [
  { id: 1, text: "How well did you sleep last night?", positive: true },
  { id: 2, text: "How much water did you drink today?", positive: true },
  { id: 3, text: "How energetic did you feel today?", positive: true },
  { id: 4, text: "How often did you feel angry today?", positive: false },
  { id: 5, text: "How often did you feel stressed today?", positive: false },
  { id: 6, text: "How motivated were you today?", positive: true },
  { id: 7, text: "How well were you able to concentrate today?", positive: true },
  { id: 8, text: "How often did you feel lonely or isolated today?", positive: false },
  { id: 9, text: "How positive did you feel today?", positive: true },
  { id: 10, text: "How satisfied are you with your day?", positive: true },
];

const SCALE_OPTIONS = [
  { value: 1, label: "Very Low" },
  { value: 2, label: "Low" },
  { value: 3, label: "Moderate" },
  { value: 4, label: "Good" },
  { value: 5, label: "Very Good" },
];

module.exports = { WELLNESS_QUESTIONS, SCALE_OPTIONS };
