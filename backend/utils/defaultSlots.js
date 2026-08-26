const Availability = require("../models/Availability");
const Counsellor = require("../models/Counsellor");

const DEFAULT_TIME_SLOTS = [
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "16:00", endTime: "17:00" },
];

/**
 * Ensures every active counsellor has the 4 default daily slots
 * for the current day and the upcoming daysAhead days.
 */
const ensureDefaultSlots = async (specificCounsellorId = null, daysAhead = 7) => {
  try {
    let counsellors = [];
    if (specificCounsellorId) {
      const found = await Counsellor.findById(specificCounsellorId);
      if (found) counsellors = [found];
    } else {
      counsellors = await Counsellor.find();
    }

    if (!counsellors.length) return;

    const dates = [];
    const today = new Date();
    for (let i = 0; i <= daysAhead; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
    }

    for (const counsellor of counsellors) {
      for (const dateStr of dates) {
        for (const slot of DEFAULT_TIME_SLOTS) {
          try {
            await Availability.updateOne(
              {
                counsellorId: counsellor._id,
                date: dateStr,
                startTime: slot.startTime,
              },
              {
                $setOnInsert: {
                  counsellorId: counsellor._id,
                  date: dateStr,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  status: "available",
                },
              },
              { upsert: true }
            );
          } catch (err) {
            // Ignore duplicate key errors if index catches concurrent creation
          }
        }
      }
    }
  } catch (error) {
    console.error("Error generating default slots:", error);
  }
};

module.exports = {
  DEFAULT_TIME_SLOTS,
  ensureDefaultSlots,
};
