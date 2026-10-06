const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const { connectDB, disconnectDB } = require("../backend/config/db");
const User = require("../backend/models/User");
const Student = require("../backend/models/Student");
const Counsellor = require("../backend/models/Counsellor");
const Appointment = require("../backend/models/Appointment");
const Assessment = require("../backend/models/Assessment");
const Feedback = require("../backend/models/Feedback");
const Conversation = require("../backend/models/Conversation");
const ChatMessage = require("../backend/models/ChatMessage");
const Notification = require("../backend/models/Notification");
const Availability = require("../backend/models/Availability");
const { seedHistoricalData } = require("../database/seedHistoricalData");

async function verify() {
  await connectDB();
  await seedHistoricalData({ forceClear: true });

  const todayStr = new Date().toISOString().slice(0, 10);
  console.log("Today string:", todayStr);

  // 1. Strict date check
  const todayOrFutureAssessments = await Assessment.countDocuments({ date: { $gte: todayStr } });
  const todayOrFutureAppointments = await Appointment.countDocuments({ date: { $gte: todayStr } });
  const todayOrFutureSlots = await Availability.countDocuments({ date: { $gte: todayStr } });

  console.log("\n--- DATE RULE VALIDATION ---");
  console.log("Today/Future Assessments count (MUST BE 0):", todayOrFutureAssessments);
  console.log("Today/Future Appointments count (MUST BE 0):", todayOrFutureAppointments);
  console.log("Today/Future Availability count (MUST BE 0):", todayOrFutureSlots);

  if (todayOrFutureAssessments > 0 || todayOrFutureAppointments > 0 || todayOrFutureSlots > 0) {
    throw new Error("FAILED: Found records dated today or future!");
  }

  // 2. Reference Integrity check
  const appts = await Appointment.find();
  for (const a of appts) {
    const s = await Student.findById(a.studentId);
    const c = await Counsellor.findById(a.counsellorId);
    const av = await Availability.findById(a.availabilityId);
    if (!s || !c || !av) {
      throw new Error("FAILED: Broken reference in Appointment " + a._id);
    }
  }
  console.log("Appointment references validated ✓");

  const fbs = await Feedback.find();
  for (const f of fbs) {
    const a = await Appointment.findById(f.appointmentId);
    if (!a || a.status !== "Completed") {
      throw new Error("FAILED: Feedback attached to non-completed or missing appointment");
    }
  }
  console.log("Feedback references & completed status validated ✓");

  const convs = await Conversation.find();
  for (const conv of convs) {
    const msgs = await ChatMessage.find({ conversationId: conv._id });
    if (msgs.length === 0) throw new Error("Empty conversation " + conv._id);
  }
  console.log("Chat conversations and messages validated ✓");

  const notifs = await Notification.find();
  console.log("Notifications count:", notifs.length, "✓");

  console.log("\nALL VERIFICATIONS PASSED SUCCESSFULLY!");
  await disconnectDB();
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
