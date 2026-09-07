/**
 * Central error handler. Any thrown error or rejected promise passed
 * to next(err) from a controller ends up here, keeping error responses
 * consistent across the whole API.
 */
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Mongoose duplicate key error (e.g. duplicate email, roll number, or slot)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).join(", ") || "field";
    return res.status(409).json({ message: `Duplicate value for: ${field}. Record already exists.` });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(" ") });
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Internal server error.",
  });
};

module.exports = { notFound, errorHandler };
