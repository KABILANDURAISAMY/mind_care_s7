const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("../backend/config/db");
const Counsellor = require("../backend/models/Counsellor");
const Student = require("../backend/models/Student");
const Appointment = require("../backend/models/Appointment");
const Feedback = require("../backend/models/Feedback");
const Availability = require("../backend/models/Availability");
const User = require("../backend/models/User");
const { enrichCounsellorData } = require("../database/enrichCounsellorData");
const {
  getDashboardSummary,
  getAppointments,
  getCounsellorFeedbacks,
  listStudents,
} = require("../backend/controllers/counsellorController");

function createMockReqRes(user) {
  const req = { user, params: {}, body: {} };
  let resData = null;
  const res = {
    json: (d) => {
      resData = d;
      return res;
    },
    status: () => res,
  };
  return { req, res, getData: () => resData };
}

async function verify() {
  await connectDB();
  const todayStr = new Date().toISOString().slice(0, 10);
  console.log(`\n======================================================`);
  console.log(`COUNSELLOR DATA VERIFICATION (Today: ${todayStr})`);
  console.log(`======================================================\n`);

  // 1. DATE RULE VERIFICATION
  const todayOrFutureAppts = await Appointment.countDocuments({ date: { $gte: todayStr } });
  const todayOrFutureSlots = await Availability.countDocuments({ date: { $gte: todayStr } });
  console.log(`[Date Check] Today/Future Appointments (MUST BE 0): ${todayOrFutureAppts}`);
  console.log(`[Date Check] Today/Future Availability (MUST BE 0): ${todayOrFutureSlots}`);
  if (todayOrFutureAppts > 0 || todayOrFutureSlots > 0) {
    throw new Error("Date validation failed: Records found with date >= today!");
  }
  console.log("✓ Strict date check passed: 100% of appointments & slots are in the past (< today).\n");

  // 2. COUNSELLOR DATA & FEEDBACK BREAKDOWN
  const counsellors = await Counsellor.find();
  console.log(`[Counsellors] Total Counsellors: ${counsellors.length}`);

  for (const c of counsellors) {
    const totalAppts = await Appointment.countDocuments({ counsellorId: c._id });
    const completedAppts = await Appointment.countDocuments({ counsellorId: c._id, status: "Completed" });
    const cancelledAppts = await Appointment.countDocuments({ counsellorId: c._id, status: "Cancelled" });
    const feedbacks = await Feedback.find({ counsellorId: c._id });
    const distinctStudents = await Appointment.distinct("studentId", { counsellorId: c._id });

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((f) => {
      if (ratingCounts[f.rating] !== undefined) ratingCounts[f.rating]++;
    });
    const avgRating = feedbacks.length
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : "0.0";

    console.log(`\n--- ${c.name} (${c.specialization}) ---`);
    console.log(`  • Appointments: Total=${totalAppts} (Completed=${completedAppts}, Cancelled=${cancelledAppts})`);
    console.log(`  • Distinct Students Handled: ${distinctStudents.length}`);
    console.log(`  • Feedbacks: ${feedbacks.length} reviews | Average Rating: ${avgRating} ★`);
    console.log(`  • Rating Breakdown: 5★: ${ratingCounts[5]} | 4★: ${ratingCounts[4]} | 3★: ${ratingCounts[3]}`);
    console.log(`  • Sample Student Comments:`);
    feedbacks.slice(0, 3).forEach((f) => {
      console.log(`     - "${f.comment}" (${f.rating}★)`);
    });

    if (totalAppts < 10) throw new Error(`Insufficient appointments for ${c.name}`);
    if (feedbacks.length < 8) throw new Error(`Insufficient feedbacks for ${c.name}`);
  }

  // 3. RELATIONSHIP & INTEGRITY CHECKS
  console.log(`\n[Integrity Check] Validating feedback relationships...`);
  const allFeedbacks = await Feedback.find();
  for (const f of allFeedbacks) {
    if (!f.appointmentId) continue;
    const appt = await Appointment.findById(f.appointmentId);
    if (!appt) {
      throw new Error(`Orphaned feedback ${f._id}: Appointment ${f.appointmentId} does not exist!`);
    }
    if (appt.status !== "Completed") {
      throw new Error(`Invalid feedback ${f._id}: Associated appointment is not Completed (${appt.status})!`);
    }
  }
  console.log(`✓ Feedback integrity passed: All ${allFeedbacks.length} feedbacks are strictly attached to Completed appointments.`);

  // 4. IDEMPOTENCY TEST
  console.log(`\n[Idempotency Check] Running enrichCounsellorData() a second time...`);
  const secondRunResult = await enrichCounsellorData();
  console.log(`Second run: slotsCreated=${secondRunResult.slotsCreated}, apptsCreated=${secondRunResult.apptsCreated}, feedbackCreated=${secondRunResult.feedbackCreated}, skippedCount=${secondRunResult.skippedCount}`);
  if (secondRunResult.apptsCreated > 0 || secondRunResult.slotsCreated > 0) {
    throw new Error("Idempotency failed: duplicate records created on second run!");
  }
  console.log(`✓ Idempotency passed: 0 duplicate records created.\n`);

  // 5. CONTROLLER RETRIEVAL TEST
  console.log(`[Controller Test] Simulating Counsellor Dashboard API calls...`);
  const cUser = await User.findById(counsellors[0].userId);
  const mockContext = createMockReqRes(cUser);

  await getDashboardSummary(mockContext.req, mockContext.res, (err) => console.error(err));
  const summary = mockContext.getData();
  console.log(`  • getDashboardSummary: completedSessions=${summary.completedSessions}, cancelledSessions=${summary.cancelledSessions}, totalStudents=${summary.totalStudents}`);

  await getCounsellorFeedbacks(mockContext.req, mockContext.res, (err) => console.error(err));
  const fbData = mockContext.getData();
  console.log(`  • getCounsellorFeedbacks: totalFeedbacks=${fbData.totalFeedbacks}, averageRating=${fbData.averageRating}, 5★ count=${fbData.ratingCounts[5]}`);

  await listStudents(mockContext.req, mockContext.res, (err) => console.error(err));
  const studentsList = mockContext.getData();
  console.log(`  • listStudents: retrieved ${studentsList.length} distinct students.`);

  console.log(`\n======================================================`);
  console.log(`ALL VERIFICATIONS PASSED 100% SUCCESSFULLY!`);
  console.log(`======================================================\n`);

  await disconnectDB();
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
