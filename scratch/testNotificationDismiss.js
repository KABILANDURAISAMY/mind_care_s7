const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../backend/models/User");
const Student = require("../backend/models/Student");
const Counsellor = require("../backend/models/Counsellor");
const Notification = require("../backend/models/Notification");
const Appointment = require("../backend/models/Appointment");

async function testFlow() {
  const mem = await MongoMemoryServer.create({ binary: { version: "7.0.14" } });
  await mongoose.connect(mem.getUri());

  // Create Student
  const sUser = await User.create({ name: "Student 1", email: "s1@test.com", password: "hash", role: "student" });
  const student = await Student.create({ userId: sUser._id, name: "Student 1", email: "s1@test.com", rollNumber: "R1", department: "CSE", year: "1", phone: "123" });

  // Create Counsellor
  const cUser = await User.create({ name: "Dr. Counsellor", email: "c1@test.com", password: "hash", role: "counsellor" });
  const counsellor = await Counsellor.create({ userId: cUser._id, name: "Dr. Counsellor", email: "c1@test.com", qualification: "PhD", specialization: "Stress", experience: 5, phone: "456" });

  // Create Notifications
  const n1 = await Notification.create({
    type: "new_slot",
    counsellorId: counsellor._id,
    counsellorName: "Dr. Counsellor",
    targetRole: "student",
    title: "New Slot",
    message: "A new slot is available",
    readBy: [],
  });

  const n2 = await Notification.create({
    type: "low_wellness_alert",
    studentId: student._id,
    counsellorId: counsellor._id,
    targetRole: "counsellor",
    title: "Wellness Alert",
    message: "Score below 30%",
    readByCounsellor: false,
    readBy: [],
  });

  // Query student notifications BEFORE dismiss
  let sNotifs = await Notification.find({
    $and: [
      {
        $or: [
          { studentId: student._id },
          { targetRole: "student" },
          { targetRole: "all" },
          { studentId: { $exists: false } },
          { studentId: null },
        ],
      },
      { readBy: { $nin: [sUser._id, student._id] } },
    ],
  });
  console.log("Student unread count BEFORE dismiss:", sNotifs.length);

  // Student dismiss n1
  await Notification.findByIdAndUpdate(n1._id, {
    $addToSet: { readBy: [sUser._id, student._id] },
  });

  // Query student notifications AFTER dismiss
  sNotifs = await Notification.find({
    $and: [
      {
        $or: [
          { studentId: student._id },
          { targetRole: "student" },
          { targetRole: "all" },
          { studentId: { $exists: false } },
          { studentId: null },
        ],
      },
      { readBy: { $nin: [sUser._id, student._id] } },
    ],
  });
  console.log("Student unread count AFTER dismiss:", sNotifs.length);

  // Inspect n1 readBy array in DB
  const fetchedN1 = await Notification.findById(n1._id);
  console.log("n1 readBy array in DB:", fetchedN1.readBy);

  // Query counsellor notifications BEFORE dismiss
  let cNotifs = await Notification.find({
    counsellorId: counsellor._id,
    type: "low_wellness_alert",
    readByCounsellor: false,
    readBy: { $nin: [cUser._id, counsellor._id] },
  });
  console.log("Counsellor unread count BEFORE dismiss:", cNotifs.length);

  // Counsellor dismiss n2
  await Notification.findOneAndUpdate(
    { _id: n2._id, counsellorId: counsellor._id },
    {
      $set: { readByCounsellor: true },
      $addToSet: { readBy: [cUser._id, counsellor._id] },
    }
  );

  // Query counsellor notifications AFTER dismiss
  cNotifs = await Notification.find({
    counsellorId: counsellor._id,
    type: "low_wellness_alert",
    readByCounsellor: false,
    readBy: { $nin: [cUser._id, counsellor._id] },
  });
  console.log("Counsellor unread count AFTER dismiss:", cNotifs.length);

  await mongoose.disconnect();
  await mem.stop();
}

testFlow().catch(console.error);
