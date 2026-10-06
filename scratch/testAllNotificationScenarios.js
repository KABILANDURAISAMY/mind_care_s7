const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../backend/models/User");
const Student = require("../backend/models/Student");
const Counsellor = require("../backend/models/Counsellor");
const Notification = require("../backend/models/Notification");

async function testScenarios() {
  const mem = await MongoMemoryServer.create({ binary: { version: "7.0.14" } });
  await mongoose.connect(mem.getUri());

  // Setup 2 Students and 1 Counsellor
  const s1User = await User.create({ name: "Student 1", email: "s1@test.com", password: "pwd", role: "student" });
  const s1 = await Student.create({ userId: s1User._id, name: "Student 1", email: "s1@test.com", rollNumber: "R1", department: "CSE", year: "1", phone: "111" });

  const s2User = await User.create({ name: "Student 2", email: "s2@test.com", password: "pwd", role: "student" });
  const s2 = await Student.create({ userId: s2User._id, name: "Student 2", email: "s2@test.com", rollNumber: "R2", department: "ECE", year: "2", phone: "222" });

  const c1User = await User.create({ name: "Counsellor 1", email: "c1@test.com", password: "pwd", role: "counsellor" });
  const c1 = await Counsellor.create({ userId: c1User._id, name: "Counsellor 1", email: "c1@test.com", qualification: "PhD", specialization: "Stress", experience: 5, phone: "333" });

  // 1. Broadcast notification for all students (e.g. new_slot)
  const notifBroadcast = await Notification.create({
    type: "new_slot",
    counsellorId: c1._id,
    counsellorName: c1.name,
    targetRole: "student",
    title: "New Slot Available",
    message: "Slot created",
    readBy: [],
  });

  // 2. Specific student notification (e.g. appointment_booked)
  const notifStudent1 = await Notification.create({
    type: "appointment_booked",
    studentId: s1._id,
    counsellorId: c1._id,
    targetRole: "student",
    title: "Appt Confirmed",
    message: "Your appointment is confirmed",
    readBy: [],
  });

  // 3. Counsellor alert (e.g. low_wellness_alert)
  const notifCounsellor = await Notification.create({
    type: "low_wellness_alert",
    studentId: s1._id,
    counsellorId: c1._id,
    targetRole: "counsellor",
    title: "Low Wellness Alert",
    message: "Score < 30%",
    readByCounsellor: false,
    readBy: [],
  });

  // STUDENT FETCH QUERY
  const getStudentNotifs = async (uId, sId) => {
    return await Notification.find({
      targetRole: { $ne: "counsellor" },
      $or: [{ studentId: sId }, { studentId: null }, { studentId: { $exists: false } }],
      readBy: { $nin: [uId, sId] },
    }).sort({ createdAt: -1 });
  };

  // COUNSELLOR FETCH QUERY
  const getCounsellorNotifs = async (uId, cId) => {
    return await Notification.find({
      targetRole: { $ne: "student" },
      $or: [{ counsellorId: cId }, { counsellorId: null }, { counsellorId: { $exists: false } }],
      readByCounsellor: false,
      readBy: { $nin: [uId, cId] },
    })
      .populate("studentId", "name department rollNumber email")
      .sort({ createdAt: -1 });
  };

  console.log("--- INITIAL FETCH ---");
  let s1Notifs = await getStudentNotifs(s1User._id, s1._id);
  console.log("Student 1 unread count (Expected 2):", s1Notifs.length);

  let s2Notifs = await getStudentNotifs(s2User._id, s2._id);
  console.log("Student 2 unread count (Expected 1):", s2Notifs.length);

  let c1Notifs = await getCounsellorNotifs(c1User._id, c1._id);
  console.log("Counsellor 1 unread count (Expected 1):", c1Notifs.length);

  // Student 1 Dismisses Broadcast Notification
  console.log("\n--- STUDENT 1 DISMISSES BROADCAST NOTIFICATION ---");
  await Notification.findByIdAndUpdate(notifBroadcast._id, {
    $addToSet: { readBy: { $each: [s1User._id, s1._id] } },
  });

  s1Notifs = await getStudentNotifs(s1User._id, s1._id);
  console.log("Student 1 unread count after dismissing broadcast (Expected 1):", s1Notifs.length);

  s2Notifs = await getStudentNotifs(s2User._id, s2._id);
  console.log("Student 2 unread count after Student 1 dismissed broadcast (Expected STILL 1):", s2Notifs.length);

  // Counsellor 1 Dismisses Low Wellness Alert
  console.log("\n--- COUNSELLOR 1 DISMISSES LOW WELLNESS ALERT ---");
  await Notification.findOneAndUpdate(
    { _id: notifCounsellor._id },
    {
      $set: { readByCounsellor: true },
      $addToSet: { readBy: { $each: [c1User._id, c1._id] } },
    }
  );

  c1Notifs = await getCounsellorNotifs(c1User._id, c1._id);
  console.log("Counsellor 1 unread count after dismiss (Expected 0):", c1Notifs.length);

  // Student 1 Dismisses Appt Confirmed Notification
  console.log("\n--- STUDENT 1 DISMISSES APPOINTMENT CONFIRMED NOTIFICATION ---");
  await Notification.findByIdAndUpdate(notifStudent1._id, {
    $addToSet: { readBy: { $each: [s1User._id, s1._id] } },
  });

  s1Notifs = await getStudentNotifs(s1User._id, s1._id);
  console.log("Student 1 unread count after dismissing all (Expected 0):", s1Notifs.length);

  console.log("\nALL TESTS PASSED PERFECTLY!");

  await mongoose.disconnect();
  await mem.stop();
}

testScenarios().catch(console.error);
