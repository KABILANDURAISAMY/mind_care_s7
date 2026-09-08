/**
 * Populates a fresh database with demo data so the app is immediately
 * explorable: 3 counsellors, 3 students, a handful of availability slots
 * (some booked, some open), one live appointment, and a short wellness
 * history for one student. Safe to re-run — it clears the six collections
 * first.
 *
 * Usage (from backend/):  npm run seed
 * Or directly:            node database/seed.js
 *
 * Demo login credentials (all use password: Passw0rd!):
 *   Student:    arun.kumar@college.edu
 *   Counsellor: dr.priya@college.edu
 */
const path = require("path");
// Ensure module resolution finds packages installed in backend/node_modules
module.paths.push(path.join(__dirname, "../backend/node_modules"));

require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../backend/models/User");
const Student = require("../backend/models/Student");
const Counsellor = require("../backend/models/Counsellor");
const Availability = require("../backend/models/Availability");
const Appointment = require("../backend/models/Appointment");
const Assessment = require("../backend/models/Assessment");
const WellnessFAQ = require("../backend/models/WellnessFAQ");
const Conversation = require("../backend/models/Conversation");
const ChatMessage = require("../backend/models/ChatMessage");
const { wellnessQAData } = require("./qaData");

const DEMO_PASSWORD = "Passw0rd!";

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function seedData(options = {}) {
  const { forceClear = false } = options;
  try {
    const existingUserCount = await User.countDocuments();
    if (existingUserCount > 0 && !forceClear) {
      console.log(`[Seed] Database already contains ${existingUserCount} users. Preserving existing records.`);
      return;
    }
  } catch (err) {
    // Continue with seed if check fails
  }

  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Counsellor.deleteMany({}),
    Availability.deleteMany({}),
    Appointment.deleteMany({}),
    Assessment.deleteMany({}),
    WellnessFAQ.deleteMany({}),
    Conversation.deleteMany({}),
    ChatMessage.deleteMany({})
  ]);
  console.log("[Seed] Initialized fresh collections for demo data.");

  // --- Counsellors ------------------------------------------------------
  const counsellorSeeds = [
    { name: "Dr. Priya Raman", email: "dr.priya@college.edu", password: "PriyaPass1!", qualification: "M.Phil Clinical Psychology", specialization: "Student Counselling", experience: 8, phone: "9840012345" },
    { name: "Dr. Arvind Nair", email: "dr.arvind@college.edu", password: "ArvindPass2!", qualification: "PsyD", specialization: "Stress Management", experience: 5, phone: "9840012346" },
    { name: "Dr. Meera Iyer", email: "dr.meera@college.edu", password: "MeeraPass3!", qualification: "M.Sc Counselling Psychology", specialization: "Anxiety & Academic Pressure", experience: 6, phone: "9840012347" },
    { name: "Dr. Rajesh Kumar", email: "dr.rajesh@college.edu", password: "RajeshPass4!", qualification: "M.D. Psychiatry", specialization: "De-addiction & Therapy", experience: 10, phone: "9840012348" },
    { name: "Dr. Sneha Sharma", email: "dr.sneha@college.edu", password: "SnehaPass5!", qualification: "Ph.D. Counseling Psychology", specialization: "Cognitive Behavioral Therapy", experience: 7, phone: "9840012349" },
  ];

  const counsellors = [];
  for (const c of counsellorSeeds) {
    const cHash = await bcrypt.hash(c.password, 10);
    const user = await User.create({ name: c.name, email: c.email, password: cHash, role: "counsellor" });
    const { password, ...cProfile } = c;
    const counsellor = await Counsellor.create({ userId: user._id, ...cProfile });
    counsellors.push(counsellor);
  }
  console.log(`[Seed] Created ${counsellors.length} counsellors.`);

  // --- Students -----------------------------------------------------------
  const studentSeeds = [
    { name: "Arun Kumar", email: "arun.kumar@college.edu", password: "ArunPass1!", rollNumber: "22CS101", department: "CSE", year: "3rd Year", phone: "9944011111" },
    { name: "Priya S", email: "priya.s@college.edu", password: "PriyaSPass2!", rollNumber: "22EC105", department: "ECE", year: "2nd Year", phone: "9944011112" },
    { name: "Karthik R", email: "karthik.r@college.edu", password: "KarthikPass3!", rollNumber: "21ME203", department: "Mechanical", year: "4th Year", phone: "9944011113" },
    { name: "Anjali Devi", email: "anjali.devi@college.edu", password: "AnjaliPass4!", rollNumber: "23IT302", department: "IT", year: "1st Year", phone: "9944011114" },
    { name: "Deepak Raj", email: "deepak.raj@college.edu", password: "DeepakPass5!", rollNumber: "22CV405", department: "Civil", year: "2nd Year", phone: "9944011115" },
  ];

  const students = [];
  for (const s of studentSeeds) {
    const sHash = await bcrypt.hash(s.password, 10);
    const user = await User.create({ name: s.name, email: s.email, password: sHash, role: "student" });
    const { password, ...sProfile } = s;
    const student = await Student.create({ userId: user._id, ...sProfile });
    students.push(student);
  }
  console.log(`[Seed] Created ${students.length} students.`);

  // --- Availability (mix of future available and already-booked slots) ---
  const slotsToCreate = [
    { counsellor: counsellors[0], date: todayPlus(1), startTime: "10:00", endTime: "10:30" },
    { counsellor: counsellors[0], date: todayPlus(1), startTime: "11:00", endTime: "11:30" },
    { counsellor: counsellors[0], date: todayPlus(2), startTime: "15:00", endTime: "15:30" },
    { counsellor: counsellors[1], date: todayPlus(1), startTime: "11:00", endTime: "11:30" },
    { counsellor: counsellors[1], date: todayPlus(3), startTime: "16:00", endTime: "16:30" },
    { counsellor: counsellors[2], date: todayPlus(2), startTime: "09:00", endTime: "09:30" },
    { counsellor: counsellors[2], date: todayPlus(4), startTime: "14:00", endTime: "14:30" },
  ];

  const availability = [];
  for (const s of slotsToCreate) {
    const slot = await Availability.create({
      counsellorId: s.counsellor._id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      status: "available",
    });
    availability.push(slot);
  }
  console.log(`[Seed] Created ${availability.length} availability slots.`);

  // --- One live appointment (books the first slot) ------------------------
  const bookedSlot = availability[0];
  bookedSlot.status = "booked";
  await bookedSlot.save();

  await Appointment.create({
    studentId: students[0]._id,
    counsellorId: bookedSlot.counsellorId,
    availabilityId: bookedSlot._id,
    studentName: students[0].name,
    department: students[0].department,
    rollNumber: students[0].rollNumber,
    date: bookedSlot.date,
    time: bookedSlot.startTime,
    issue: "Academic Stress",
    details: "Feeling overwhelmed with upcoming exams and assignment deadlines.",
    status: "Booked",
  });
  console.log("[Seed] Created 1 sample appointment.");

  // --- Sample wellness history for the first student -----------------------
  const scores = [62, 55, 48, 70, 66];
  for (let i = 0; i < scores.length; i++) {
    const date = todayPlus(-(scores.length - i));
    const percentage = scores[i];
    const totalScore = Math.round((percentage / 100) * 50);
    const base = Math.max(1, Math.min(5, Math.round(totalScore / 10)));
    const responses = Array(10).fill(base);
    await Assessment.create({ studentId: students[0]._id, date, responses, totalScore, percentage });
  }
  console.log(`[Seed] Created ${scores.length} wellness check-in records for ${students[0].name}.`);

  // --- Seed Wellness Q/A Data ---------------------------------------------
  await WellnessFAQ.insertMany(wellnessQAData);
  console.log(`[Seed] Inserted ${wellnessQAData.length} Wellness FAQ entries.`);

  console.log("\n[Seed] Complete. Generated Accounts:");
  console.log("\n--- Students ---");
  for (const s of studentSeeds) {
    console.log(`- Email: ${s.email} | Password: ${s.password}`);
  }
  console.log("\n--- Counsellors ---");
  for (const c of counsellorSeeds) {
    console.log(`- Email: ${c.email} | Password: ${c.password}`);
  }
  console.log("");
}

// Standalone execution
if (require.main === module) {
  const { connectDB, disconnectDB } = require("../backend/config/db");
  (async () => {
    await connectDB();
    await seedData();
    await disconnectDB();
  })().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}

module.exports = { seedData };
