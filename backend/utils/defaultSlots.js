const Availability = require("../models/Availability");
const Counsellor = require("../models/Counsellor");

const DEFAULT_TIME_SLOTS = [
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "16:00", endTime: "17:00" },
];

const getLocalDateString = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Ensures every active counsellor has the 4 default daily slots
 * for the current day and the upcoming daysAhead days.
 */
const ensureDefaultSlots = async (specificCounsellorId = null, daysAhead = 7) => {
  const query = specificCounsellorId ? { _id: specificCounsellorId } : {};
  const counsellors = await Counsellor.find(query);

  const now = new Date();
  const targetDates = [];
  
  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    // Exclude Sunday (0)
    if (d.getDay() !== 0) {
      targetDates.push(getLocalDateString(d));
    }
  }

  for (const counsellor of counsellors) {
    for (const dateStr of targetDates) {
      for (const slot of DEFAULT_TIME_SLOTS) {
        // Use an upsert with $setOnInsert to only create if it doesn't exist
        // thus avoiding duplicate slots and preserving any status changes if it was already booked/removed
        await Availability.updateOne(
          {
            counsellorId: counsellor._id,
            date: dateStr,
            startTime: slot.startTime
          },
          {
            $setOnInsert: {
              counsellorId: counsellor._id,
              date: dateStr,
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: "available"
            }
          },
          { upsert: true }
        );
      }
    }
  }
};

module.exports = {
  DEFAULT_TIME_SLOTS,
  ensureDefaultSlots,
};
