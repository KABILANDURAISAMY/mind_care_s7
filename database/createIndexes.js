/**
 * Explicitly (re)builds the indexes that back MindCare's core business rules.
 * Mongoose creates these automatically from the schemas in backend/models/
 * on first connection, but keeping them here too makes the two rules that
 * matter most impossible to miss, and gives you a way to rebuild them by
 * hand (e.g. after restoring a backup) without touching application code.
 *
 * Usage:
 *   MONGO_URI="mongodb://127.0.0.1:27017/mindcare" node createIndexes.js
 */
const mongoose = require("mongoose");
require("dotenv").config({ path: "../backend/.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mindcare";

async function run() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  console.log(`Connected to ${MONGO_URI}`);

  // users: fast, unique lookup by login email
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  console.log("users.email unique index ✓");

  // students: unique roll number (spec section 6)
  await db.collection("students").createIndex({ rollNumber: 1 }, { unique: true });
  await db.collection("students").createIndex({ userId: 1 }, { unique: true });
  console.log("students.rollNumber / userId unique indexes ✓");

  // counsellors: one profile per user account
  await db.collection("counsellors").createIndex({ userId: 1 }, { unique: true });
  console.log("counsellors.userId unique index ✓");

  // availability: a counsellor cannot create the same slot twice
  await db
    .collection("availability")
    .createIndex({ counsellorId: 1, date: 1, startTime: 1 }, { unique: true });
  console.log("availability compound unique index ✓");

  // appointments: THE core anti-double-booking rule. Unique among active
  // statuses only, so a cancelled slot can be re-booked by someone else.
  await db.collection("appointments").createIndex(
    { counsellorId: 1, date: 1, time: 1 },
    {
      unique: true,
      partialFilterExpression: { status: { $in: ["Booked", "Completed"] } },
      name: "one_active_booking_per_slot",
    }
  );
  console.log("appointments partial unique index (one_active_booking_per_slot) ✓");

  // assessments: one wellness check-in per student per day
  await db.collection("assessments").createIndex({ studentId: 1, date: 1 }, { unique: true });
  console.log("assessments compound unique index ✓");

  console.log("\nAll indexes created successfully.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Index creation failed:", err.message);
  process.exit(1);
});
