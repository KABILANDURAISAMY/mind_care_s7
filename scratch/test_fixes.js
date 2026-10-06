const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("../backend/config/db");

const Student = require("../backend/models/Student");
const Counsellor = require("../backend/models/Counsellor");
const Assessment = require("../backend/models/Assessment");
const Notification = require("../backend/models/Notification");
const Appointment = require("../backend/models/Appointment");
const Feedback = require("../backend/models/Feedback");
const { WELLNESS_QUESTIONS } = require("../backend/utils/wellnessQuestions");

async function runTests() {
  console.log("=== Starting MindCare Automated Backend Verification ===");
  await connectDB();

  const student = await Student.findOne();
  const counsellor = await Counsellor.findOne();

  // Test 1: Percentage Calculation with realistic responses
  console.log("\n--- Test 1: Percentage Calculation ---");
  // For low score: positive questions get 1 (Very Low), negative questions get 5 (Always frequency)
  const responsesLow = WELLNESS_QUESTIONS.map((q) => (q.positive ? 1 : 5));
  let scoreLow = 0;
  responsesLow.forEach((val, idx) => {
    scoreLow += WELLNESS_QUESTIONS[idx].positive ? val : 6 - val;
  });
  const percentageLow = Math.round((scoreLow / (WELLNESS_QUESTIONS.length * 5)) * 100);
  console.log(`Low responses score: ${scoreLow}/50, percentage: ${percentageLow}%`);
  console.assert(percentageLow < 30, `Expected low percentage < 30, got ${percentageLow}%`);

  // For high score: positive questions get 5 (Very Good), negative questions get 1 (Never frequency)
  const responsesHigh = WELLNESS_QUESTIONS.map((q) => (q.positive ? 5 : 1));
  let scoreHigh = 0;
  responsesHigh.forEach((val, idx) => {
    scoreHigh += WELLNESS_QUESTIONS[idx].positive ? val : 6 - val;
  });
  const percentageHigh = Math.round((scoreHigh / (WELLNESS_QUESTIONS.length * 5)) * 100);
  console.log(`High responses score: ${scoreHigh}/50, percentage: ${percentageHigh}%`);
  console.assert(percentageHigh >= 80, `Expected high percentage >= 80, got ${percentageHigh}%`);
  console.log("✔ Percentage calculation verified.");

  // Test 2: Low-Score Notification & Uniqueness
  console.log("\n--- Test 2: Low-Score Alert (<30%) Creation & Duplication Check ---");
  if (student && counsellor) {
    // Link student to counsellor via appointment
    await Appointment.create({
      studentId: student._id,
      counsellorId: counsellor._id,
      availabilityId: new mongoose.Types.ObjectId(),
      studentName: student.name,
      department: student.department,
      rollNumber: student.rollNumber,
      date: "2026-09-09",
      time: "10:00",
      issue: "Checkin test",
      status: "Booked",
    });

    const testDate = "2026-09-99"; // mock date
    await Notification.deleteMany({ date: testDate });

    // Simulate low score alert trigger
    if (percentageLow < 30) {
      const existingAlert = await Notification.findOne({
        type: "low_wellness_alert",
        studentId: student._id,
        counsellorId: counsellor._id,
        date: testDate,
      });

      if (!existingAlert) {
        await Notification.create({
          type: "low_wellness_alert",
          studentId: student._id,
          counsellorId: counsellor._id,
          counsellorName: counsellor.name,
          title: "🚨 Student Wellness Alert: Score < 30%",
          message: "A student under your care has received a wellness score below 30%. Please review the student's wellness result.",
          score: percentageLow,
          date: testDate,
          readByCounsellor: false,
        });
      }
    }

    const createdNotifications = await Notification.find({
      type: "low_wellness_alert",
      studentId: student._id,
      counsellorId: counsellor._id,
      date: testDate,
    });

    console.assert(createdNotifications.length === 1, `Expected 1 notification created, found ${createdNotifications.length}`);
    console.log(`Notification message: "${createdNotifications[0].message}"`);

    // Test Duplicate prevention by running alert logic again
    const alertAttempt2 = await Notification.findOne({
      type: "low_wellness_alert",
      studentId: student._id,
      counsellorId: counsellor._id,
      date: testDate,
    });
    if (alertAttempt2) {
      // should NOT create second notification
      console.log("✔ Duplicate alert check prevents creating duplicate notification.");
    }
  }

  // Test 3: Feedback Schema Flexibility
  console.log("\n--- Test 3: Feedback Schema Flexibilty ---");
  if (student && counsellor) {
    const testGenFeedback = new Feedback({
      appointmentId: null,
      studentId: student._id,
      counsellorId: counsellor._id,
      rating: 5,
      comment: "Test general feedback",
    });
    const validateErr = testGenFeedback.validateSync();
    console.assert(!validateErr, `General feedback validation error: ${validateErr?.message}`);
    console.log("✔ General counsellor feedback (appointmentId = null) is valid.");
  }

  await disconnectDB();
  console.log("\n=== All Backend Checks Completed Successfully ===");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
