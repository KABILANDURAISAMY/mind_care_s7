const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => typeof email === "string" && EMAIL_REGEX.test(email);

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

const isValidTime = (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

/**
 * Combines a YYYY-MM-DD date string and HH:mm time string into a Date
 * object interpreted in server-local time. Centralized here so every
 * part of the codebase parses appointment date/time identically.
 */
const combineDateTime = (date, time) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

module.exports = {
  isValidEmail,
  isNonEmptyString,
  isValidDate,
  isValidTime,
  combineDateTime,
};
