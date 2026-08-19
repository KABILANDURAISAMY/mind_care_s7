require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const counsellorRoutes = require("./routes/counsellorRoutes");

const app = express();

// --- Core middleware -------------------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// --- Health check ------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "MindCare API", time: new Date().toISOString() });
});

// --- Routes --------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/counsellor", counsellorRoutes);

// --- Errors ----------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`MindCare API listening on http://localhost:${PORT}`);
  });
};

start();
