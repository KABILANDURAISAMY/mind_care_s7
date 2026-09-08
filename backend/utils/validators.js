const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => typeof email === "string" && EMAIL_REGEX.test(email);

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

const isValidTime = (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

/**
 * Combines a YYYY-MM-DD date string and HH:mm time string into a Date
 * object, explicitly interpreted in IST (Asia/Kolkata, UTC+05:30).
 */
const combineDateTime = (date, time) => {
  if (!date || !time) return new Date(0);
  const formattedTime = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${formattedTime}+05:30`);
};

/**
 * Returns current Date in IST.
 */
const getISTNow = () => new Date();

/**
 * Returns today's date string in YYYY-MM-DD according to IST timezone.
 */
const getISTDateString = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;

  return `${year}-${month}-${day}`;
};

module.exports = {
  isValidEmail,
  isNonEmptyString,
  isValidDate,
  isValidTime,
  combineDateTime,
  getISTNow,
  getISTDateString,
};

