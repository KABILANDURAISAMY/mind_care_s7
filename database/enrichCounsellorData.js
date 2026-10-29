/**
 * MindCare - Realistic Counsellor Data Enrichment Script
 *
 * Adds realistic historical appointment history, completed sessions, and
 * student feedback for all 5 counsellors across the previous 1–2 months.
 *
 * Safe, idempotent, non-destructive:
 * - Checks existing appointments before inserting.
 * - Does NOT overwrite, reset, or delete existing data.
 * - All dates are strictly BEFORE today (< 2026-10-12).
 * - Feedback is attached ONLY to Completed appointments.
 */

const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const mongoose = require("mongoose");
const User = require("../backend/models/User");
const Student = require("../backend/models/Student");
const Counsellor = require("../backend/models/Counsellor");
const Availability = require("../backend/models/Availability");
const Appointment = require("../backend/models/Appointment");
const Feedback = require("../backend/models/Feedback");

function getPastDateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - Math.max(1, daysAgo));
  return d.toISOString().slice(0, 10);
}

function getPastDateTime(daysAgo, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - Math.max(1, daysAgo));
  d.setHours(hour, minute, 0, 0);
  return d;
}

// Additional realistic counsellor appointment & feedback specs
const additionalCounsellorSpecs = [
  // --- Dr. Priya Raman (Student Counselling) ---
  { cEmail: "dr.priya@college.edu", sRoll: "22EC105", daysAgo: 54, time: "11:00", endTime: "11:30", type: "Offline", status: "Completed", issue: "College Adjustment", details: "Finding it hard to adjust to the new semester routine.", rating: 5, comment: "The counsellor was friendly and supportive." },
  { cEmail: "dr.priya@college.edu", sRoll: "21ME203", daysAgo: 51, time: "14:30", endTime: "15:00", type: "Online", status: "Completed", issue: "Study Habits", details: "Need tips on preparing for technical subjects.", rating: 4, comment: "The session was useful and easy to understand." },
  { cEmail: "dr.priya@college.edu", sRoll: "23IT302", daysAgo: 46, time: "10:00", endTime: "10:30", type: "Offline", status: "Completed", issue: "Hostel Life Stress", details: "Feeling homesick and unable to concentrate.", rating: 5, comment: "The counsellor listened to my problem and helped me." },
  { cEmail: "dr.priya@college.edu", sRoll: "22CV405", daysAgo: 43, time: "15:00", endTime: "15:30", type: "Online", status: "Completed", issue: "Assignment Deadlines", details: "Struggling to finish drafting assignments on time.", rating: 4, comment: "I got some good advice to manage my stress." },
  { cEmail: "dr.priya@college.edu", sRoll: "22EC105", daysAgo: 39, time: "09:30", endTime: "10:00", type: "Offline", status: "Cancelled", cancelledBy: "student", reason: "Caught fever", issue: "Routine Management", details: "Balancing lab and theory." },
  { cEmail: "dr.priya@college.edu", sRoll: "21ME203", daysAgo: 33, time: "11:00", endTime: "11:30", type: "Online", status: "Completed", issue: "Exam Preparation", details: "Nervous about internal assessment marks.", rating: 5, comment: "I feel better after talking to the counsellor." },
  { cEmail: "dr.priya@college.edu", sRoll: "23IT302", daysAgo: 27, time: "14:00", endTime: "14:30", type: "Offline", status: "Completed", issue: "Team Project Issues", details: "Disagreements with teammates on group project.", rating: 4, comment: "Helpful session. Got simple tips to handle my group work." },
  { cEmail: "dr.priya@college.edu", sRoll: "22CV405", daysAgo: 21, time: "10:30", endTime: "11:00", type: "Online", status: "Completed", issue: "Focus Problems", details: "Losing focus during afternoon lecture classes.", rating: 3, comment: "Good session overall, though 30 minutes felt a bit short." },
  { cEmail: "dr.priya@college.edu", sRoll: "22EC105", daysAgo: 14, time: "15:30", endTime: "16:00", type: "Offline", status: "Completed", issue: "Midterm Follow-up", details: "Reviewing improvement in study schedule.", rating: 5, comment: "Very polite and gave simple steps to follow every day." },
  { cEmail: "dr.priya@college.edu", sRoll: "21ME203", daysAgo: 7, time: "11:00", endTime: "11:30", type: "Online", status: "Completed", issue: "Seminar Anxiety", details: "Presentation next week for final year project.", rating: 5, comment: "Helped me calm down and organize my presentation." },

  // --- Dr. Arvind Nair (Stress Management) ---
  { cEmail: "dr.arvind@college.edu", sRoll: "22CS101", daysAgo: 55, time: "10:00", endTime: "10:30", type: "Offline", status: "Completed", issue: "Lab Stress", details: "Pressure during programming lab evaluations.", rating: 5, comment: "The counsellor was friendly and supportive." },
  { cEmail: "dr.arvind@college.edu", sRoll: "21ME203", daysAgo: 52, time: "14:00", endTime: "14:30", type: "Online", status: "Completed", issue: "Workload Management", details: "Heavy syllabus in mechanical core papers.", rating: 4, comment: "I got some good advice to manage my stress." },
  { cEmail: "dr.arvind@college.edu", sRoll: "23IT302", daysAgo: 47, time: "11:30", endTime: "12:00", type: "Offline", status: "Completed", issue: "Daily Routine Stress", details: "Feeling tired by evening and unable to study.", rating: 5, comment: "I feel better after talking to the counsellor." },
  { cEmail: "dr.arvind@college.edu", sRoll: "22CV405", daysAgo: 44, time: "15:00", endTime: "15:30", type: "Online", status: "Completed", issue: "Time Crunch", details: "Balancing college classes and sports practice.", rating: 4, comment: "The session was useful and easy to understand." },
  { cEmail: "dr.arvind@college.edu", sRoll: "22CS101", daysAgo: 36, time: "10:00", endTime: "10:30", type: "Offline", status: "Completed", issue: "Breathing Techniques", details: "Learning relaxation exercises for exam days.", rating: 5, comment: "Shared some good breathing techniques that actually work." },
  { cEmail: "dr.arvind@college.edu", sRoll: "21ME203", daysAgo: 29, time: "16:00", endTime: "16:30", type: "Online", status: "Cancelled", cancelledBy: "student", reason: "Special lab class clash", issue: "Stress from Deadlines", details: "Assignment load." },
  { cEmail: "dr.arvind@college.edu", sRoll: "23IT302", daysAgo: 24, time: "09:30", endTime: "10:00", type: "Offline", status: "Completed", issue: "Test Overwhelm", details: "Two cycle tests scheduled on consecutive days.", rating: 4, comment: "The counsellor listened to my problem and helped me." },
  { cEmail: "dr.arvind@college.edu", sRoll: "22CV405", daysAgo: 17, time: "14:00", endTime: "14:30", type: "Online", status: "Completed", issue: "Exam Pressure", details: "Worrying about upcoming semester practicals.", rating: 5, comment: "I feel much more relaxed now about the practicals." },
  { cEmail: "dr.arvind@college.edu", sRoll: "22CS101", daysAgo: 11, time: "11:00", endTime: "11:30", type: "Offline", status: "Completed", issue: "Stress Relief Routine", details: "Following up on daily stress habits.", rating: 5, comment: "Very understanding and gave practical tips for my stress." },
  { cEmail: "dr.arvind@college.edu", sRoll: "23IT302", daysAgo: 3, time: "15:30", endTime: "16:00", type: "Online", status: "Completed", issue: "Pre-Exam Tension", details: "Nervousness before unit test papers.", rating: 4, comment: "Good advice on how to stay calm before tests." },

  // --- Dr. Meera Iyer (Anxiety & Academic Pressure) ---
  { cEmail: "dr.meera@college.edu", sRoll: "22CS101", daysAgo: 56, time: "10:30", endTime: "11:00", type: "Offline", status: "Completed", issue: "Theory Paper Anxiety", details: "Anxious about memorizing long formulas and derivations.", rating: 5, comment: "The session was useful and easy to understand." },
  { cEmail: "dr.meera@college.edu", sRoll: "23IT302", daysAgo: 53, time: "15:00", endTime: "15:30", type: "Online", status: "Completed", issue: "Class Participation Anxiety", details: "Hesitating to ask doubts in front of everyone.", rating: 4, comment: "The counsellor listened to my problem and helped me." },
  { cEmail: "dr.meera@college.edu", sRoll: "22CV405", daysAgo: 49, time: "09:30", endTime: "10:00", type: "Offline", status: "Completed", issue: "Viva Voce Nervousness", details: "Freezing up during external viva questions.", rating: 5, comment: "I feel better after talking to the counsellor." },
  { cEmail: "dr.meera@college.edu", sRoll: "22CS101", daysAgo: 41, time: "14:00", endTime: "14:30", type: "Online", status: "Completed", issue: "Grade Worries", details: "Constant fear of getting lower CGPA this semester.", rating: 4, comment: "I got some good advice to manage my stress." },
  { cEmail: "dr.meera@college.edu", sRoll: "22EC105", daysAgo: 37, time: "11:00", endTime: "11:30", type: "Offline", status: "Cancelled", cancelledBy: "student", reason: "Bus delayed", issue: "Presentation Fear", details: "Class seminar." },
  { cEmail: "dr.meera@college.edu", sRoll: "23IT302", daysAgo: 31, time: "16:00", endTime: "16:30", type: "Online", status: "Completed", issue: "Social Anxiety", details: "Feeling nervous when interacting with senior students.", rating: 5, comment: "The counsellor was friendly and supportive." },
  { cEmail: "dr.meera@college.edu", sRoll: "22CV405", daysAgo: 26, time: "10:00", endTime: "10:30", type: "Offline", status: "Completed", issue: "Assignment Anxiety", details: "Feeling panicky when deadlines approach quickly.", rating: 4, comment: "Helpful tips on taking things step by step." },
  { cEmail: "dr.meera@college.edu", sRoll: "22CS101", daysAgo: 19, time: "14:30", endTime: "15:00", type: "Online", status: "Completed", issue: "Confidence Building", details: "Building confidence for departmental project seminar.", rating: 5, comment: "Nice talking to the counsellor. I felt heard." },
  { cEmail: "dr.meera@college.edu", sRoll: "22EC105", daysAgo: 12, time: "09:30", endTime: "10:00", type: "Offline", status: "Completed", issue: "Exam Hall Anxiety", details: "Hands shaking before question paper distribution.", rating: 5, comment: "The breathing exercise helped me calm down before my test." },
  { cEmail: "dr.meera@college.edu", sRoll: "22CV405", daysAgo: 5, time: "15:00", endTime: "15:30", type: "Online", status: "Completed", issue: "Academic Expectations", details: "Stress from high expectations at home.", rating: 3, comment: "Good session, helped me think clearly about expectations." },

  // --- Dr. Rajesh Kumar (De-addiction & Therapy) ---
  { cEmail: "dr.rajesh@college.edu", sRoll: "22CS101", daysAgo: 57, time: "11:30", endTime: "12:00", type: "Offline", status: "Completed", issue: "Screen Time Distraction", details: "Spending too many hours on YouTube and reels late at night.", rating: 5, comment: "I feel better after talking to the counsellor." },
  { cEmail: "dr.rajesh@college.edu", sRoll: "22EC105", daysAgo: 50, time: "14:00", endTime: "14:30", type: "Online", status: "Completed", issue: "Sleep Schedule Reset", details: "Going to bed at 3 AM and missing morning 8 AM classes.", rating: 4, comment: "I got some good advice to manage my stress." },
  { cEmail: "dr.rajesh@college.edu", sRoll: "21ME203", daysAgo: 46, time: "10:00", endTime: "10:30", type: "Offline", status: "Completed", issue: "Gaming Distraction", details: "Gaming with friends taking away study hours.", rating: 5, comment: "The session was useful and easy to understand." },
  { cEmail: "dr.rajesh@college.edu", sRoll: "23IT302", daysAgo: 42, time: "15:30", endTime: "16:00", type: "Online", status: "Completed", issue: "Energy & Fatigue", details: "Feeling constantly exhausted and relying on caffeine drinks.", rating: 4, comment: "The counsellor was friendly and supportive." },
  { cEmail: "dr.rajesh@college.edu", sRoll: "22EC105", daysAgo: 34, time: "11:00", endTime: "11:30", type: "Offline", status: "Completed", issue: "Healthy Daily Routine", details: "Setting up regular morning exercise and breakfast times.", rating: 5, comment: "The counsellor listened to my problem and helped me." },
  { cEmail: "dr.rajesh@college.edu", sRoll: "21ME203", daysAgo: 27, time: "16:00", endTime: "16:30", type: "Online", status: "Completed", issue: "Habit Tracking", details: "Reviewing reduction in gaming and screen time.", rating: 5, comment: "Really helped me cut down on late night gaming." },
  { cEmail: "dr.rajesh@college.edu", sRoll: "22CS101", daysAgo: 22, time: "09:30", endTime: "10:00", type: "Offline", status: "Cancelled", cancelledBy: "student", reason: "Departmental symposium duty", issue: "Screen Fatigue", details: "Need habit tips." },
  { cEmail: "dr.rajesh@college.edu", sRoll: "22EC105", daysAgo: 16, time: "14:30", endTime: "15:00", type: "Online", status: "Completed", issue: "Sleep Routine Follow-up", details: "Sleeping before 11:30 PM consistently this week.", rating: 5, comment: "My sleep pattern has improved a lot after following the advice." },
  { cEmail: "dr.rajesh@college.edu", sRoll: "21ME203", daysAgo: 9, time: "10:30", endTime: "11:00", type: "Offline", status: "Completed", issue: "Study Environment Setup", details: "Keeping study table clean and phone outside room.", rating: 4, comment: "Simple practical tips that were easy to implement." },
  { cEmail: "dr.rajesh@college.edu", sRoll: "23IT302", daysAgo: 3, time: "14:00", endTime: "14:30", type: "Online", status: "Completed", issue: "Energy Restoration", details: "Feeling more energetic during morning lectures.", rating: 5, comment: "The counsellor was very polite and gave realistic goals." },

  // --- Dr. Sneha Sharma (Cognitive Behavioral Therapy) ---
  { cEmail: "dr.sneha@college.edu", sRoll: "22CS101", daysAgo: 58, time: "10:00", endTime: "10:30", type: "Offline", status: "Completed", issue: "Negative Thoughts", details: "Dwelling on past semester backlogs and failures.", rating: 5, comment: "The counsellor listened to my problem and helped me." },
  { cEmail: "dr.sneha@college.edu", sRoll: "22EC105", daysAgo: 53, time: "14:30", endTime: "15:00", type: "Online", status: "Completed", issue: "Perfectionism Stress", details: "Stress from wanting 100% perfection in all mini-projects.", rating: 4, comment: "I got some good advice to manage my stress." },
  { cEmail: "dr.sneha@college.edu", sRoll: "21ME203", daysAgo: 48, time: "11:00", endTime: "11:30", type: "Offline", status: "Completed", issue: "Peer Comparison", details: "Feeling inferior when batchmates discuss coding ranks.", rating: 5, comment: "I feel better after talking to the counsellor." },
  { cEmail: "dr.sneha@college.edu", sRoll: "22CV405", daysAgo: 45, time: "15:30", endTime: "16:00", type: "Online", status: "Completed", issue: "Overthinking Exam Results", details: "Unable to stop checking marks portal and overthinking.", rating: 4, comment: "The session was useful and easy to understand." },
  { cEmail: "dr.sneha@college.edu", sRoll: "22EC105", daysAgo: 36, time: "09:30", endTime: "10:00", type: "Offline", status: "Completed", issue: "Cognitive Reframing", details: "Learning to replace self-critical thoughts with constructive ones.", rating: 5, comment: "The counsellor was friendly and supportive." },
  { cEmail: "dr.sneha@college.edu", sRoll: "21ME203", daysAgo: 31, time: "15:00", endTime: "15:30", type: "Online", status: "Cancelled", cancelledBy: "student", reason: "Hostel floor meeting", issue: "Thought Restructuring", details: "Managing anxiety." },
  { cEmail: "dr.sneha@college.edu", sRoll: "22CS101", daysAgo: 24, time: "11:30", endTime: "12:00", type: "Offline", status: "Completed", issue: "Presentation Confidence", details: "Practicing positive affirmations before viva presentation.", rating: 5, comment: "I was nervous before the meeting, but the counsellor made me feel comfortable." },
  { cEmail: "dr.sneha@college.edu", sRoll: "22CV405", daysAgo: 18, time: "16:00", endTime: "16:30", type: "Online", status: "Completed", issue: "Fear of Making Errors", details: "Accepting minor mistakes as part of the learning curve.", rating: 4, comment: "Good session. Helped me stop overthinking minor mistakes." },
  { cEmail: "dr.sneha@college.edu", sRoll: "22EC105", daysAgo: 11, time: "14:00", endTime: "14:30", type: "Offline", status: "Completed", issue: "Mindset Check-in", details: "Reviewing weekly progress on balanced thinking habits.", rating: 5, comment: "Very helpful tips on how to handle negative thoughts." },
  { cEmail: "dr.sneha@college.edu", sRoll: "21ME203", daysAgo: 2, time: "10:00", endTime: "10:30", type: "Online", status: "Completed", issue: "Self-Belief for Placements", details: "Building confidence for campus technical interview rounds.", rating: 5, comment: "Encouraging session. I feel much more confident now." },
];

async function enrichCounsellorData() {
  console.log("=== ENRICHING COUNSELLOR REALISTIC HISTORICAL DATA ===");
  const todayStr = new Date().toISOString().slice(0, 10);
  console.log(`Current Date: ${todayStr}. All added records will strictly be < ${todayStr}.`);

  const counsellors = await Counsellor.find();
  const students = await Student.find();

  if (!counsellors.length || !students.length) {
    console.error("No counsellors or students found in DB. Please run base seed first.");
    return;
  }

  const counsellorMap = new Map();
  counsellors.forEach((c) => counsellorMap.set(c.email, c));

  const studentMap = new Map();
  students.forEach((s) => studentMap.set(s.rollNumber, s));

  let apptsCreated = 0;
  let feedbackCreated = 0;
  let slotsCreated = 0;
  let skippedCount = 0;

  for (const item of additionalCounsellorSpecs) {
    const counsellor = counsellorMap.get(item.cEmail);
    const student = studentMap.get(item.sRoll);

    if (!counsellor || !student) {
      console.warn(`Skipping spec: Missing counsellor (${item.cEmail}) or student (${item.sRoll})`);
      continue;
    }

    const dateStr = getPastDateStr(item.daysAgo);
    if (dateStr >= todayStr) {
      console.warn(`Safety check: Date ${dateStr} is today or future. Skipping.`);
      continue;
    }

    // Check if appointment already exists for this counsellor, date, and time
    const existingAppt = await Appointment.findOne({
      counsellorId: counsellor._id,
      date: dateStr,
      time: item.time,
    });

    if (existingAppt) {
      skippedCount++;
      // If appointment exists and is completed, ensure feedback exists
      if (existingAppt.status === "Completed" && item.rating) {
        const existingFb = await Feedback.findOne({ appointmentId: existingAppt._id });
        if (!existingFb) {
          const fbTime = getPastDateTime(item.daysAgo, 16, 0);
          await Feedback.create({
            appointmentId: existingAppt._id,
            studentId: student._id,
            counsellorId: counsellor._id,
            rating: item.rating,
            comment: item.comment,
            createdAt: fbTime,
            updatedAt: fbTime,
          });
          feedbackCreated++;
        }
      }
      continue;
    }

    // 1. Create or reuse Availability slot
    const slotStatus = item.status === "Completed" ? "completed" : "cancelled";
    let slot = await Availability.findOne({
      counsellorId: counsellor._id,
      date: dateStr,
      startTime: item.time,
    });

    if (!slot) {
      slot = await Availability.create({
        counsellorId: counsellor._id,
        date: dateStr,
        startTime: item.time,
        endTime: item.endTime,
        status: slotStatus,
        createdAt: getPastDateTime(item.daysAgo + 1, 9, 0),
      });
      slotsCreated++;
    }

    // 2. Create Appointment
    const apptDateTime = getPastDateTime(item.daysAgo, parseInt(item.time.split(":")[0]), parseInt(item.time.split(":")[1]));
    const appointmentData = {
      studentId: student._id,
      counsellorId: counsellor._id,
      availabilityId: slot._id,
      studentName: student.name,
      department: student.department,
      rollNumber: student.rollNumber,
      date: dateStr,
      time: item.time,
      issue: item.issue,
      details: item.details || "",
      appointmentType: item.type,
      meetingLink: item.type === "Online" ? `https://meet.google.com/mindcare-${item.daysAgo}-${student.rollNumber.toLowerCase()}` : "",
      status: item.status,
      createdAt: apptDateTime,
      updatedAt: apptDateTime,
    };

    if (item.status === "Cancelled") {
      appointmentData.cancelledAt = apptDateTime;
      appointmentData.cancellationReason = item.reason || "Cancelled by student";
      appointmentData.cancelledBy = item.cancelledBy || "student";
    }

    const appt = await Appointment.create(appointmentData);
    apptsCreated++;

    // 3. Create Student Feedback for completed session
    if (item.status === "Completed" && item.rating) {
      const fbTime = getPastDateTime(item.daysAgo, 16, 0);
      await Feedback.create({
        appointmentId: appt._id,
        studentId: student._id,
        counsellorId: counsellor._id,
        rating: item.rating,
        comment: item.comment,
        createdAt: fbTime,
        updatedAt: fbTime,
      });
      feedbackCreated++;
    }
  }

  console.log("\n========================================================");
  console.log("ENRICHMENT SUMMARY:");
  console.log(`- New Availability Slots Created: ${slotsCreated}`);
  console.log(`- New Appointments Added: ${apptsCreated}`);
  console.log(`- New Student Feedbacks Added: ${feedbackCreated}`);
  console.log(`- Skipped Existing Records (Idempotent): ${skippedCount}`);
  console.log("========================================================\n");

  return { slotsCreated, apptsCreated, feedbackCreated, skippedCount };
}

if (require.main === module) {
  const { connectDB, disconnectDB } = require("../backend/config/db");
  (async () => {
    await connectDB();
    await enrichCounsellorData();
    await disconnectDB();
  })().catch((err) => {
    console.error("Enrichment failed:", err);
    process.exit(1);
  });
}

module.exports = { enrichCounsellorData, additionalCounsellorSpecs };
