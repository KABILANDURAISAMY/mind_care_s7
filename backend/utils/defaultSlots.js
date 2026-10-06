const Availability = require("../models/Availability");
const Counsellor = require("../models/Counsellor");

const DEFAULT_TIME_SLOTS = [
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "16:00", endTime: "17:00" },
];

/**
 * ensureDefaultSlots is disabled to stop automatic daily slot creation.
 * Slots are explicitly created by counsellors.
 */
const ensureDefaultSlots = async (specificCounsellorId = null, daysAhead = 7) => {
  return;
};

module.exports = {
  DEFAULT_TIME_SLOTS,
  ensureDefaultSlots,
};
