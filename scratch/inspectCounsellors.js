const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const { connectDB, disconnectDB } = require("../backend/config/db");
const User = require("../backend/models/User");
const Student = require("../backend/models/Student");
const Counsellor = require("../backend/models/Counsellor");
const Appointment = require("../backend/models/Appointment");
const Feedback = require("../backend/models/Feedback");
const Assessment = require("../backend/models/Assessment");
const Availability = require("../backend/models/Availability");

async function inspect() {
  await connectDB();
  console.log("=== CURRENT DATA COUNTS ===");
  console.log("Users:", await User.countDocuments());
  console.log("Students:", await Student.countDocuments());
  console.log("Counsellors:", await Counsellor.countDocuments());
  console.log("Appointments:", await Appointment.countDocuments());
  console.log("Feedback:", await Feedback.countDocuments());
  console.log("Assessments:", await Assessment.countDocuments());
  console.log("Availability:", await Availability.countDocuments());

  const counsellors = await Counsellor.find();
  console.log("\n=== COUNSELLOR DETAILS & CURRENT APPOINTMENT/FEEDBACK BREAKDOWN ===");
  for (const c of counsellors) {
    const apptCount = await Appointment.countDocuments({ counsellorId: c._id });
    const completedCount = await Appointment.countDocuments({ counsellorId: c._id, status: "Completed" });
    const fbCount = await Feedback.countDocuments({ counsellorId: c._id });
    console.log(`- ${c.name} (${c.specialization}) [_id: ${c._id}]: TotalAppts=${apptCount}, Completed=${completedCount}, Feedbacks=${fbCount}`);
  }

  const students = await Student.find();
  console.log("\n=== STUDENTS ===");
  for (const s of students) {
    console.log(`- ${s.name} (${s.rollNumber}, ${s.department}) [_id: ${s._id}]`);
  }

  await disconnectDB();
}

inspect().catch((err) => {
  console.error("Inspection error:", err);
  process.exit(1);
});
