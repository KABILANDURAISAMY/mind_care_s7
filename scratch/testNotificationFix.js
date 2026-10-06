const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../backend/models/User");
const Student = require("../backend/models/Student");
const Counsellor = require("../backend/models/Counsellor");
const Notification = require("../backend/models/Notification");
const { getUnreadNotifications, dismissNotification } = require("../backend/controllers/studentController");
const { getCounsellorNotifications, dismissCounsellorNotification } = require("../backend/controllers/counsellorController");

// Mock Express req & res
function createMockReqRes(user, params = {}, body = {}) {
  const req = { user, params, body };
  let resData = null;
  let statusCode = 200;
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      resData = data;
      return res;
    },
  };
  return { req, res, getResult: () => ({ code: statusCode, data: resData }) };
}

async function runEndToEndVerification() {
  const mem = await MongoMemoryServer.create({ binary: { version: "7.0.14" } });
  await mongoose.connect(mem.getUri());

  console.log("==================================================================");
  console.log("NOTIFICATION DISMISS PERSISTENCE VERIFICATION");
  console.log("==================================================================");

  // 1. Setup Student and Counsellor accounts
  const studentUser = await User.create({ name: "Arun Kumar", email: "arun.kumar@college.edu", password: "hash", role: "student" });
  const student = await Student.create({ userId: studentUser._id, name: "Arun Kumar", email: "arun.kumar@college.edu", rollNumber: "22CS101", department: "CSE", year: "3rd Year", phone: "9944011111" });

  const counsellorUser = await User.create({ name: "Dr. Priya Raman", email: "dr.priya@college.edu", password: "hash", role: "counsellor" });
  const counsellor = await Counsellor.create({ userId: counsellorUser._id, name: "Dr. Priya Raman", email: "dr.priya@college.edu", qualification: "PhD", specialization: "Counselling", experience: 8, phone: "9840012345" });

  // TEST 1: STUDENT NOTIFICATION FLOW
  console.log("\n--- TEST 1: STUDENT NOTIFICATION DISMISS PERSISTENCE ---");

  // Create Notification A & B for Student
  const notifA = await Notification.create({
    type: "new_slot",
    counsellorId: counsellor._id,
    counsellorName: counsellor.name,
    targetRole: "student",
    title: "Slot A Available",
    message: "New slot on Monday",
    readBy: [],
  });

  const notifB = await Notification.create({
    type: "appointment_booked",
    studentId: student._id,
    counsellorId: counsellor._id,
    targetRole: "student",
    title: "Slot B Confirmed",
    message: "Your appointment is set",
    readBy: [],
  });

  // Step 1: Login & fetch notifications
  const sFetch1 = createMockReqRes(studentUser);
  await getUnreadNotifications(sFetch1.req, sFetch1.res, (err) => console.error(err));
  let sNotifsList = sFetch1.getResult().data;
  console.log(`[Student Login 1] Unread notifications count: ${sNotifsList.length} (Expected 2)`);
  if (sNotifsList.length !== 2) throw new Error("Student Login 1 failed");

  // Step 2: Dismiss Notification A ("Got it / Dismiss")
  console.log(`[Action] Clicking 'Dismiss' on Notification A (${notifA._id})...`);
  const sDismiss = createMockReqRes(studentUser, { id: notifA._id.toString() });
  await dismissNotification(sDismiss.req, sDismiss.res, (err) => console.error(err));

  // Step 3: Refresh page (refetch)
  const sFetch2 = createMockReqRes(studentUser);
  await getUnreadNotifications(sFetch2.req, sFetch2.res, (err) => console.error(err));
  sNotifsList = sFetch2.getResult().data;
  console.log(`[Page Refresh] Unread count: ${sNotifsList.length} (Expected 1: Notification B only)`);
  if (sNotifsList.length !== 1 || sNotifsList[0]._id.toString() !== notifB._id.toString()) {
    throw new Error("Page refresh check failed — Notification A reappeared!");
  }
  console.log("✓ Page refresh check passed: Notification A stayed gone while B remains!");

  // Step 4: Logout & Login again
  console.log("[Action] Logging out -> Logging in again as Student...");
  const sFetch3 = createMockReqRes(studentUser);
  await getUnreadNotifications(sFetch3.req, sFetch3.res, (err) => console.error(err));
  sNotifsList = sFetch3.getResult().data;
  console.log(`[Student Login 2] Unread count: ${sNotifsList.length} (Expected 1: Notification B only)`);
  if (sNotifsList.length !== 1 || sNotifsList[0]._id.toString() !== notifB._id.toString()) {
    throw new Error("Logout/Login check failed — Dismissed Notification A reappeared!");
  }
  console.log("✓ Logout/Login check passed: Notification A NEVER reappears!");

  // Step 5: Trigger a genuinely NEW Notification C
  console.log("[Action] Creating a genuinely NEW Notification C...");
  const notifC = await Notification.create({
    type: "new_slot",
    counsellorId: counsellor._id,
    counsellorName: counsellor.name,
    targetRole: "student",
    title: "Slot C Available",
    message: "New slot on Friday",
    readBy: [],
  });

  const sFetch4 = createMockReqRes(studentUser);
  await getUnreadNotifications(sFetch4.req, sFetch4.res, (err) => console.error(err));
  sNotifsList = sFetch4.getResult().data;
  console.log(`[After New Notif] Unread count: ${sNotifsList.length} (Expected 2: Notification B & C)`);
  if (sNotifsList.length !== 2) throw new Error("New notification failed to appear");
  console.log("✓ Genuinely new notification C appeared normally!");

  // TEST 2: COUNSELLOR NOTIFICATION FLOW
  console.log("\n--- TEST 2: COUNSELLOR NOTIFICATION DISMISS PERSISTENCE ---");

  // Create Low Wellness Alert for Counsellor
  const cNotif1 = await Notification.create({
    type: "low_wellness_alert",
    studentId: student._id,
    counsellorId: counsellor._id,
    targetRole: "counsellor",
    title: "Wellness Alert: Score < 30%",
    message: "Low wellness score recorded",
    readByCounsellor: false,
    readBy: [],
  });

  // Step 1: Login & fetch
  const cFetch1 = createMockReqRes(counsellorUser);
  await getCounsellorNotifications(cFetch1.req, cFetch1.res, (err) => console.error(err));
  let cNotifsList = cFetch1.getResult().data;
  console.log(`[Counsellor Login 1] Unread count: ${cNotifsList.length} (Expected 1)`);
  if (cNotifsList.length !== 1) throw new Error("Counsellor Login 1 failed");

  // Step 2: Dismiss notification
  console.log(`[Action] Counsellor clicks 'Dismiss' on Wellness Alert (${cNotif1._id})...`);
  const cDismiss = createMockReqRes(counsellorUser, { id: cNotif1._id.toString() });
  await dismissCounsellorNotification(cDismiss.req, cDismiss.res, (err) => console.error(err));

  // Step 3: Refresh & Logout/Login check
  const cFetch2 = createMockReqRes(counsellorUser);
  await getCounsellorNotifications(cFetch2.req, cFetch2.res, (err) => console.error(err));
  cNotifsList = cFetch2.getResult().data;
  console.log(`[Counsellor Login 2 (After Logout/Login)] Unread count: ${cNotifsList.length} (Expected 0)`);
  if (cNotifsList.length !== 0) throw new Error("Counsellor notification reappeared!");
  console.log("✓ Counsellor dismissal persisted perfectly across login sessions!");

  console.log("\n==================================================================");
  console.log("ALL NOTIFICATION PERSISTENCE TESTS PASSED 100% SUCCESSFULLY!");
  console.log("==================================================================");

  await mongoose.disconnect();
  await mem.stop();
}

runEndToEndVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
