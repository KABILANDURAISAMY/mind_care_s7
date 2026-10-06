/**
 * MindCare - Historical Demo Data Population Script
 *
 * Populates MongoDB with realistic historical demo data spanning the past 45–60 days
 * up to YESTERDAY. Strictly NO records are created for today or future dates.
 *
 * Safe and repeatable to run.
 */

const path = require("path");
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
const Feedback = require("../backend/models/Feedback");
const Conversation = require("../backend/models/Conversation");
const ChatMessage = require("../backend/models/ChatMessage");
const Notification = require("../backend/models/Notification");
const WellnessFAQ = require("../backend/models/WellnessFAQ");
const { WELLNESS_QUESTIONS } = require("../backend/utils/wellnessQuestions");
const { wellnessQAData } = require("./qaData");

// Helper date functions (strictly past dates: daysAgo >= 1)
function getPastDateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - Math.max(1, daysAgo));
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getPastDateTime(daysAgo, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - Math.max(1, daysAgo));
  d.setHours(hour, minute, 0, 0);
  return d;
}

// Generate valid wellness answers matching target percentage
function generateWellnessResponses(targetPercentage) {
  const targetTotal = Math.max(10, Math.min(50, Math.round((targetPercentage / 100) * 50)));
  let itemScores = Array(10).fill(1);
  let remaining = targetTotal - 10;

  while (remaining > 0) {
    const idx = Math.floor(Math.random() * 10);
    if (itemScores[idx] < 5) {
      itemScores[idx]++;
      remaining--;
    }
  }

  let actualTotal = 0;
  const responses = itemScores.map((score, idx) => {
    const isPositive = WELLNESS_QUESTIONS[idx].positive;
    const val = isPositive ? score : (6 - score);
    actualTotal += isPositive ? val : (6 - val);
    return val;
  });

  const actualPercentage = Math.round((actualTotal / 50) * 100);
  return { responses, totalScore: actualTotal, percentage: actualPercentage };
}

async function seedHistoricalData(options = {}) {
  const { forceClear = true } = options;

  console.log("[Historical Seed] Starting data population process...");
  console.log(`[Historical Seed] Reference Today: ${new Date().toISOString().slice(0, 10)}. All inserted records will be dated <= Yesterday.`);

  if (forceClear) {
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Counsellor.deleteMany({}),
      Availability.deleteMany({}),
      Appointment.deleteMany({}),
      Assessment.deleteMany({}),
      Feedback.deleteMany({}),
      Conversation.deleteMany({}),
      ChatMessage.deleteMany({}),
      Notification.deleteMany({}),
      WellnessFAQ.deleteMany({}),
    ]);
    console.log("[Historical Seed] Cleared existing collections for fresh seeding.");
  }

  // 1. COUNSELLORS
  const counsellorSeeds = [
    { name: "Dr. Priya Raman", title: "Dr.", email: "dr.priya@college.edu", password: "PriyaPass1!", qualification: "M.Phil Clinical Psychology", specialization: "Student Counselling", experience: 8, phone: "9840012345" },
    { name: "Dr. Arvind Nair", title: "Dr.", email: "dr.arvind@college.edu", password: "ArvindPass2!", qualification: "PsyD", specialization: "Stress Management", experience: 5, phone: "9840012346" },
    { name: "Dr. Meera Iyer", title: "Dr.", email: "dr.meera@college.edu", password: "MeeraPass3!", qualification: "M.Sc Counselling Psychology", specialization: "Anxiety & Academic Pressure", experience: 6, phone: "9840012347" },
    { name: "Dr. Rajesh Kumar", title: "Dr.", email: "dr.rajesh@college.edu", password: "RajeshPass4!", qualification: "M.D. Psychiatry", specialization: "De-addiction & Therapy", experience: 10, phone: "9840012348" },
    { name: "Dr. Sneha Sharma", title: "Dr.", email: "dr.sneha@college.edu", password: "SnehaPass5!", qualification: "Ph.D. Counseling Psychology", specialization: "Cognitive Behavioral Therapy", experience: 7, phone: "9840012349" },
  ];

  const counsellors = [];
  for (const c of counsellorSeeds) {
    const cHash = await bcrypt.hash(c.password, 10);
    const user = await User.create({ name: c.name, email: c.email, password: cHash, role: "counsellor" });
    const { password, ...cProfile } = c;
    const counsellor = await Counsellor.create({ userId: user._id, ...cProfile });
    counsellors.push(counsellor);
  }
  console.log(`[Historical Seed] Inserted ${counsellors.length} counsellors.`);

  // 2. STUDENTS
  const studentSeeds = [
    { name: "Arun Kumar", email: "arun.kumar@college.edu", password: "ArunPass1!", rollNumber: "22CS101", department: "Computer Science & Engineering", year: "3rd Year", phone: "9944011111" },
    { name: "Priya S", email: "priya.s@college.edu", password: "PriyaSPass2!", rollNumber: "22EC105", department: "Electronics & Communication", year: "2nd Year", phone: "9944011112" },
    { name: "Karthik R", email: "karthik.r@college.edu", password: "KarthikPass3!", rollNumber: "21ME203", department: "Mechanical Engineering", year: "4th Year", phone: "9944011113" },
    { name: "Anjali Devi", email: "anjali.devi@college.edu", password: "AnjaliPass4!", rollNumber: "23IT302", department: "Information Technology", year: "1st Year", phone: "9944011114" },
    { name: "Deepak Raj", email: "deepak.raj@college.edu", password: "DeepakPass5!", rollNumber: "22CV405", department: "Civil Engineering", year: "2nd Year", phone: "9944011115" },
  ];

  const students = [];
  for (const s of studentSeeds) {
    const sHash = await bcrypt.hash(s.password, 10);
    const user = await User.create({ name: s.name, email: s.email, password: sHash, role: "student" });
    const { password, ...sProfile } = s;
    const student = await Student.create({ userId: user._id, ...sProfile });
    students.push(student);
  }
  console.log(`[Historical Seed] Inserted ${students.length} students.`);

  // 3. WELLNESS CHECK-INS (ASSESSMENTS)
  // Generating records across previous 55 days for 5 students
  let totalAssessmentsCount = 0;
  const studentCheckinConfigs = [
    // Arun: 28 check-ins, mostly 65-88%, 1 low score (26%) on day 18
    { studentIndex: 0, daysAgoList: [52, 50, 48, 46, 43, 41, 39, 37, 35, 33, 31, 29, 27, 25, 23, 21, 18, 16, 14, 12, 10, 8, 7, 5, 4, 3, 2, 1], lowDays: { 18: 26 } },
    // Priya S: 30 check-ins, high score trend 74-94%
    { studentIndex: 1, daysAgoList: [53, 51, 49, 47, 45, 42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 19, 17, 15, 13, 11, 9, 8, 6, 5, 4, 3, 2, 1], lowDays: {} },
    // Karthik R: 25 check-ins, moderate 52-70%, 1 low score (22%) on day 32
    { studentIndex: 2, daysAgoList: [54, 51, 48, 45, 42, 39, 36, 32, 29, 27, 24, 22, 19, 17, 15, 13, 11, 9, 7, 5, 4, 3, 2, 1], lowDays: { 32: 22 } },
    // Anjali Devi: 27 check-ins, 46-78%, 1 low score (28%) on day 9
    { studentIndex: 3, daysAgoList: [52, 49, 47, 44, 42, 39, 37, 34, 31, 29, 26, 24, 21, 19, 17, 14, 12, 9, 7, 6, 5, 4, 3, 2, 1], lowDays: { 9: 28 } },
    // Deepak Raj: 26 check-ins, 58-82%
    { studentIndex: 4, daysAgoList: [53, 50, 47, 44, 41, 38, 35, 33, 30, 28, 25, 23, 20, 18, 16, 14, 11, 9, 7, 5, 4, 3, 2, 1], lowDays: {} },
  ];

  const lowWellnessAlertsToCreate = [];

  for (const config of studentCheckinConfigs) {
    const student = students[config.studentIndex];
    for (const daysAgo of config.daysAgoList) {
      const dateStr = getPastDateStr(daysAgo);
      let targetPct = config.lowDays[daysAgo];
      if (!targetPct) {
        // Base percentage between 50% and 90%
        targetPct = Math.floor(Math.random() * 38) + 52;
      }

      const { responses, totalScore, percentage } = generateWellnessResponses(targetPct);
      const createdAt = getPastDateTime(daysAgo, 8, 30);

      await Assessment.create({
        studentId: student._id,
        date: dateStr,
        responses,
        totalScore,
        percentage,
        createdAt,
        updatedAt: createdAt,
      });
      totalAssessmentsCount++;

      if (percentage < 30) {
        lowWellnessAlertsToCreate.push({
          student,
          daysAgo,
          dateStr,
          score: percentage,
        });
      }
    }
  }
  console.log(`[Historical Seed] Inserted ${totalAssessmentsCount} wellness check-in records across previous 55 days.`);

  // 4. APPOINTMENTS & AVAILABILITY
  const appointmentSpecs = [
    { daysAgo: 50, time: "10:00", endTime: "10:30", sIdx: 0, cIdx: 0, type: "Offline", status: "Completed", issue: "Academic Stress", details: "Feeling overwhelmed with 3rd year coursework and upcoming internal tests." },
    { daysAgo: 48, time: "11:00", endTime: "11:30", sIdx: 1, cIdx: 1, type: "Online", status: "Completed", issue: "Stress Management", details: "Seeking advice on balancing lab reports and extracurricular activities." },
    { daysAgo: 45, time: "14:00", endTime: "14:30", sIdx: 2, cIdx: 2, type: "Offline", status: "Completed", issue: "Exam Anxiety", details: "Experiencing nervousness and sleep restlessness before major assessments." },
    { daysAgo: 42, time: "15:30", endTime: "16:00", sIdx: 3, cIdx: 4, type: "Online", status: "Completed", issue: "First Year Adjustment", details: "Adjusting to college schedule and building new friendships." },
    { daysAgo: 40, time: "10:30", endTime: "11:00", sIdx: 4, cIdx: 3, type: "Offline", status: "Cancelled", cancelledBy: "student", reason: "Lab exam schedule conflict", issue: "Workload Overload", details: "Managing multiple project submissions." },
    { daysAgo: 38, time: "11:30", endTime: "12:00", sIdx: 0, cIdx: 0, type: "Online", status: "Completed", issue: "Midterm Exam Planning", details: "Structuring a study timetable for upcoming midterms." },
    { daysAgo: 35, time: "09:30", endTime: "10:00", sIdx: 1, cIdx: 1, type: "Offline", status: "Completed", issue: "Time Management", details: "Learning prioritization techniques for daily routine." },
    { daysAgo: 32, time: "14:30", endTime: "15:00", sIdx: 2, cIdx: 2, type: "Online", status: "Completed", issue: "Low Wellness Follow-up", details: "Discussion following low energy and stress score." },
    { daysAgo: 30, time: "16:00", endTime: "16:30", sIdx: 3, cIdx: 4, type: "Offline", status: "Completed", issue: "Public Speaking Anxiety", details: "Nervousness regarding class seminar presentations." },
    { daysAgo: 28, time: "11:00", endTime: "11:30", sIdx: 4, cIdx: 3, type: "Online", status: "Completed", issue: "Focus & Habit Building", details: "Techniques to reduce phone distraction during study hours." },
    { daysAgo: 25, time: "10:00", endTime: "10:30", sIdx: 0, cIdx: 0, type: "Offline", status: "Completed", issue: "Project Deadline Stress", details: "Managing group project coordination and deadlines." },
    { daysAgo: 23, time: "15:00", endTime: "15:30", sIdx: 1, cIdx: 2, type: "Online", status: "Completed", issue: "Academic Pressure", details: "Strategies to handle high grade expectations." },
    { daysAgo: 20, time: "11:30", endTime: "12:00", sIdx: 2, cIdx: 1, type: "Online", status: "Cancelled", cancelledBy: "counsellor", reason: "Faculty meeting emergency", issue: "Placement Interview Stress", details: "Preparing mentally for upcoming campus interviews." },
    { daysAgo: 18, time: "14:00", endTime: "14:30", sIdx: 0, cIdx: 0, type: "Online", status: "Completed", issue: "Low Wellness Check-in Consultation", details: "Reviewing low wellness score and implementing breathing exercises." },
    { daysAgo: 15, time: "10:30", endTime: "11:00", sIdx: 3, cIdx: 4, type: "Offline", status: "Completed", issue: "Exam Prep & Sleep Hygiene", details: "Maintaining healthy sleep rhythm during exam week." },
    { daysAgo: 13, time: "16:00", endTime: "16:30", sIdx: 4, cIdx: 3, type: "Online", status: "Completed", issue: "Concentration Techniques", details: "Using Pomodoro method for effective studying." },
    { daysAgo: 10, time: "11:00", endTime: "11:30", sIdx: 1, cIdx: 1, type: "Offline", status: "Completed", issue: "Career Direction & Placement", details: "Evaluating career options and reducing future uncertainty." },
    { daysAgo: 8, time: "15:00", endTime: "15:30", sIdx: 3, cIdx: 4, type: "Online", status: "Completed", issue: "Wellness Alert Support Session", details: "Follow-up consultation after wellness alert notification." },
    { daysAgo: 6, time: "09:30", endTime: "10:00", sIdx: 2, cIdx: 2, type: "Offline", status: "Cancelled", cancelledBy: "student", reason: "Fever and rest recommended", issue: "Assignment Overload", details: "Managing multiple submission deadlines." },
    { daysAgo: 5, time: "14:00", endTime: "14:30", sIdx: 0, cIdx: 0, type: "Offline", status: "Completed", issue: "Final Project Review", details: "Reviewing progress and reducing stress before final submissions." },
    { daysAgo: 4, time: "11:30", endTime: "12:00", sIdx: 4, cIdx: 3, type: "Online", status: "Cancelled", cancelledBy: "student", reason: "Family event engagement", issue: "Sleep & Rest Problems", details: "Discussion on fatigue management." },
    { daysAgo: 2, time: "10:00", endTime: "10:30", sIdx: 1, cIdx: 1, type: "Online", status: "Completed", issue: "Pre-placement Mock Interview De-stress", details: "Final prep and relaxation techniques before interviews." },
  ];

  const createdAppointments = [];
  let completedAppointmentsCount = 0;

  for (const spec of appointmentSpecs) {
    const student = students[spec.sIdx];
    const counsellor = counsellors[spec.cIdx];
    const dateStr = getPastDateStr(spec.daysAgo);
    const apptDateTime = getPastDateTime(spec.daysAgo, parseInt(spec.time.split(":")[0]), parseInt(spec.time.split(":")[1]));

    const slotStatus = spec.status === "Completed" ? "completed" : "cancelled";
    const slot = await Availability.create({
      counsellorId: counsellor._id,
      date: dateStr,
      startTime: spec.time,
      endTime: spec.endTime,
      status: slotStatus,
      createdAt: getPastDateTime(spec.daysAgo + 1, 9, 0),
    });

    const appointmentData = {
      studentId: student._id,
      counsellorId: counsellor._id,
      availabilityId: slot._id,
      studentName: student.name,
      department: student.department,
      rollNumber: student.rollNumber,
      date: dateStr,
      time: spec.time,
      issue: spec.issue,
      details: spec.details,
      appointmentType: spec.type,
      meetingLink: spec.type === "Online" ? `https://meet.google.com/mindcare-${spec.daysAgo}-${spec.sIdx}` : "",
      status: spec.status,
      createdAt: apptDateTime,
      updatedAt: apptDateTime,
    };

    if (spec.status === "Cancelled") {
      appointmentData.cancelledAt = apptDateTime;
      appointmentData.cancellationReason = spec.reason;
      appointmentData.cancelledBy = spec.cancelledBy;
    } else {
      completedAppointmentsCount++;
    }

    const appt = await Appointment.create(appointmentData);
    createdAppointments.push({ appt, spec, student, counsellor });
  }

  console.log(`[Historical Seed] Inserted ${createdAppointments.length} appointments (${completedAppointmentsCount} completed, ${createdAppointments.length - completedAppointmentsCount} cancelled).`);

  // 5. FEEDBACK & RATINGS (For Completed Appointments)
  const feedbackComments = [
    { rating: 5, comment: "Dr. Priya Raman gave me very practical stress reduction exercises that worked well before my exams. Highly recommended!" },
    { rating: 5, comment: "Super supportive counsellor! Understood my situation immediately and helped me create a realistic study routine." },
    { rating: 4, comment: "The session was very helpful for organizing my revision schedule. Clear and actionable guidance." },
    { rating: 5, comment: "Dr. Meera was extremely patient and helped me manage my anxiety around group project presentations." },
    { rating: 4, comment: "Good suggestions on time management and sleep hygiene. Felt much lighter after our conversation." },
    { rating: 5, comment: "Dr. Arvind provided great insights into managing placement stress and building interview confidence." },
    { rating: 5, comment: "Felt understood and supported. The breathing techniques recommended really helped during test week." },
    { rating: 4, comment: "Very empathetic guidance. Focused on practical daily habits rather than generic advice." },
    { rating: 3, comment: "Good session overall, but ran out of time to address all my secondary questions." },
    { rating: 5, comment: "Dr. Sneha's cognitive reframing techniques made a noticeable difference in how I handle exam pressure." },
    { rating: 5, comment: "Extremely beneficial session! I feel much more confident about my final semester submissions." },
    { rating: 4, comment: "Helpful advice on balancing academics with personal health. Will definitely book another follow-up if needed." },
    { rating: 5, comment: "Dr. Rajesh helped me break down my heavy workload into small manageable tasks. Excellent session!" },
    { rating: 5, comment: "Great listener and very encouraging. Provided clear steps to improve my concentration during study hours." },
    { rating: 4, comment: "Very reassuring discussion on career direction. Helped lower my constant overthinking about placements." },
  ];

  const completedAppts = createdAppointments.filter((item) => item.spec.status === "Completed");
  let feedbackCount = 0;

  for (let i = 0; i < Math.min(completedAppts.length, feedbackComments.length); i++) {
    const { appt, student, counsellor, spec } = completedAppts[i];
    const fbInfo = feedbackComments[i];
    const fbTime = getPastDateTime(spec.daysAgo, 16, 0);

    await Feedback.create({
      appointmentId: appt._id,
      studentId: student._id,
      counsellorId: counsellor._id,
      rating: fbInfo.rating,
      comment: fbInfo.comment,
      createdAt: fbTime,
      updatedAt: fbTime,
    });
    feedbackCount++;
  }
  console.log(`[Historical Seed] Inserted ${feedbackCount} student feedback & rating records.`);

  // 6. CHAT CONVERSATIONS & MESSAGES
  const chatScenarios = [
    {
      sIdx: 0, cIdx: 0, // Arun & Dr. Priya
      daysAgoStart: 45,
      messages: [
        { sender: "student", msg: "Hello Dr. Priya, I am feeling a bit stressed about my 3rd year project submission deadline.", daysAgo: 45, hour: 10, min: 15 },
        { sender: "counsellor", msg: "Hello Arun! That is completely understandable. Have you broken down your project into specific milestones?", daysAgo: 45, hour: 10, min: 25 },
        { sender: "student", msg: "Not really, I feel overwhelmed seeing how much coding and documentation is left.", daysAgo: 45, hour: 10, min: 32 },
        { sender: "counsellor", msg: "Let's focus on setting 3 key priorities for this week. Feel free to book a slot so we can review a weekly plan together.", daysAgo: 45, hour: 10, min: 40 },
        { sender: "student", msg: "Thank you Dr. Priya, I will book a slot today.", daysAgo: 45, hour: 10, min: 45 },
        { sender: "student", msg: "Dr. Priya, the 25-minute Pomodoro focus blocks you suggested during our session are helping me concentrate much better!", daysAgo: 36, hour: 14, min: 10 },
        { sender: "counsellor", msg: "That is fantastic news, Arun! Keep up the consistent rhythm and remember to take real rest during the breaks.", daysAgo: 36, hour: 14, min: 30 },
        { sender: "student", msg: "Will do. Thanks again for your guidance!", daysAgo: 36, hour: 14, min: 35 },
      ]
    },
    {
      sIdx: 1, cIdx: 1, // Priya S & Dr. Arvind
      daysAgoStart: 40,
      messages: [
        { sender: "student", msg: "Good afternoon Dr. Arvind, I wanted to ask about techniques to stay calm before seminar presentations.", daysAgo: 40, hour: 15, min: 0 },
        { sender: "counsellor", msg: "Good afternoon Priya! Pre-presentation nervousness is very common. Have you tried slow box-breathing before stepping onto the stage?", daysAgo: 40, hour: 15, min: 15 },
        { sender: "student", msg: "I haven't tried box-breathing yet. How does it work?", daysAgo: 40, hour: 15, min: 22 },
        { sender: "counsellor", msg: "Inhale for 4 seconds, hold for 4, exhale for 4, and hold for 4. Doing 3 cycles calms your autonomic nervous system.", daysAgo: 40, hour: 15, min: 30 },
        { sender: "student", msg: "I practiced box breathing before today's seminar and it helped me keep my voice steady!", daysAgo: 22, hour: 11, min: 0 },
        { sender: "counsellor", msg: "Excellent job Priya! Using grounding techniques builds long-term confidence.", daysAgo: 22, hour: 11, min: 20 },
      ]
    },
    {
      sIdx: 2, cIdx: 2, // Karthik R & Dr. Meera
      daysAgoStart: 42,
      messages: [
        { sender: "student", msg: "Hello Dr. Meera, I am finding it hard to sleep properly because of exam worries.", daysAgo: 42, hour: 20, min: 10 },
        { sender: "counsellor", msg: "Hello Karthik. Sleep disruption often happens when study thoughts stay active at bedtime. Avoid studying directly on your bed.", daysAgo: 42, hour: 20, min: 30 },
        { sender: "student", msg: "I usually read my notes in bed until late night.", daysAgo: 42, hour: 20, min: 35 },
        { sender: "counsellor", msg: "Separate your study space from your sleep space. Turn off screens 30 minutes before bed and try writing down your worry list earlier in the evening.", daysAgo: 42, hour: 20, min: 45 },
        { sender: "student", msg: "Thank you Dr. Meera, I will implement a strict wind-down routine starting tonight.", daysAgo: 42, hour: 20, min: 50 },
      ]
    },
    {
      sIdx: 3, cIdx: 4, // Anjali Devi & Dr. Sneha
      daysAgoStart: 38,
      messages: [
        { sender: "student", msg: "Dr. Sneha, as a 1st year student I am feeling a bit lonely and overwhelmed by the fast college pace.", daysAgo: 38, hour: 16, min: 5 },
        { sender: "counsellor", msg: "Welcome Anjali! Transitioning to college is a major adjustment. Give yourself time to settle in.", daysAgo: 38, hour: 16, min: 20 },
        { sender: "student", msg: "Everyone else seems to have found their group already.", daysAgo: 38, hour: 16, min: 28 },
        { sender: "counsellor", msg: "Many students feel the exact same way silently. Joining a campus interest club or study group is a great gentle step.", daysAgo: 38, hour: 16, min: 40 },
        { sender: "student", msg: "I joined the IT department coding club yesterday and met two really nice batchmates!", daysAgo: 14, hour: 12, min: 15 },
        { sender: "counsellor", msg: "That is wonderful progress Anjali! Small steps make a huge difference.", daysAgo: 14, hour: 12, min: 35 },
      ]
    },
    {
      sIdx: 4, cIdx: 3, // Deepak Raj & Dr. Rajesh
      daysAgoStart: 30,
      messages: [
        { sender: "student", msg: "Hello Dr. Rajesh, I get easily distracted by social media while studying for lab viva.", daysAgo: 30, hour: 11, min: 0 },
        { sender: "counsellor", msg: "Hello Deepak! Digital distraction happens when the brain seeks quick relief from study fatigue. Try app blockers during study blocks.", daysAgo: 30, hour: 11, min: 25 },
        { sender: "student", msg: "That makes sense. I will keep my phone in another room during study sessions.", daysAgo: 30, hour: 11, min: 35 },
        { sender: "counsellor", msg: "Great strategy! Keep your study environment clean and distraction-free.", daysAgo: 30, hour: 11, min: 45 },
      ]
    },
  ];

  let conversationsCount = 0;
  let chatMessagesCount = 0;

  for (const scenario of chatScenarios) {
    const student = students[scenario.sIdx];
    const counsellor = counsellors[scenario.cIdx];
    const studentUser = await User.findById(student.userId);
    const counsellorUser = await User.findById(counsellor.userId);

    const conv = await Conversation.create({
      studentId: student._id,
      counsellorId: counsellor._id,
      createdAt: getPastDateTime(scenario.daysAgoStart, 10, 0),
      updatedAt: getPastDateTime(scenario.messages[scenario.messages.length - 1].daysAgo, scenario.messages[scenario.messages.length - 1].hour, scenario.messages[scenario.messages.length - 1].min),
    });
    conversationsCount++;

    let lastMsgText = "";
    let lastMsgTime = null;

    for (const mSpec of scenario.messages) {
      const isStudentSender = mSpec.sender === "student";
      const senderId = isStudentSender ? studentUser._id : counsellorUser._id;
      const receiverId = isStudentSender ? counsellorUser._id : studentUser._id;
      const msgTime = getPastDateTime(mSpec.daysAgo, mSpec.hour, mSpec.min);

      await ChatMessage.create({
        conversationId: conv._id,
        senderId,
        receiverId,
        senderRole: mSpec.sender,
        message: mSpec.msg,
        read: true,
        createdAt: msgTime,
        updatedAt: msgTime,
      });
      chatMessagesCount++;

      lastMsgText = mSpec.msg;
      lastMsgTime = msgTime;
    }

    conv.lastMessage = lastMsgText;
    conv.lastMessageAt = lastMsgTime;
    await conv.save();
  }
  console.log(`[Historical Seed] Inserted ${conversationsCount} chat conversations with ${chatMessagesCount} messages.`);

  // 7. NOTIFICATIONS
  let notificationsCount = 0;

  // Appointment booked notifications
  for (const item of createdAppointments) {
    const { spec, student, counsellor } = item;
    const nTime = getPastDateTime(spec.daysAgo + 1, 11, 0);
    const counsellorName = counsellor.title ? `${counsellor.title} ${counsellor.name}` : counsellor.name;

    await Notification.create({
      studentId: student._id,
      counsellorId: counsellor._id,
      counsellorName,
      targetRole: "student",
      type: "appointment_booked",
      title: "Appointment Confirmed",
      message: `Your appointment with ${counsellorName} is confirmed for ${getPastDateStr(spec.daysAgo)} at ${spec.time}.`,
      date: getPastDateStr(spec.daysAgo),
      time: spec.time,
      readBy: [student.userId],
      createdAt: nTime,
      updatedAt: nTime,
    });
    notificationsCount++;
  }

  // Low wellness alert notifications
  for (const alertItem of lowWellnessAlertsToCreate) {
    const { student, daysAgo, dateStr, score } = alertItem;
    // Notify the student's counsellor (Arun -> Dr. Priya, Karthik -> Dr. Meera, Anjali -> Dr. Sneha)
    let assignedCounsellor = counsellors[0];
    if (student.rollNumber === "21ME203") assignedCounsellor = counsellors[2];
    if (student.rollNumber === "23IT302") assignedCounsellor = counsellors[4];

    const alertTime = getPastDateTime(daysAgo, 9, 0);

    await Notification.create({
      type: "low_wellness_alert",
      studentId: student._id,
      counsellorId: assignedCounsellor._id,
      counsellorName: assignedCounsellor.name,
      targetRole: "counsellor",
      title: "🚨 Student Wellness Alert: Score < 30%",
      message: `A student under your care (${student.name}) received a wellness score of ${score}%. Please review the result.`,
      score,
      date: dateStr,
      readByCounsellor: true,
      createdAt: alertTime,
      updatedAt: alertTime,
    });
    notificationsCount++;
  }

  // Cancellation notifications
  const cancelledAppts = createdAppointments.filter((item) => item.spec.status === "Cancelled");
  for (const item of cancelledAppts) {
    const { spec, student, counsellor } = item;
    const nTime = getPastDateTime(spec.daysAgo, 9, 30);
    const counsellorName = counsellor.title ? `${counsellor.title} ${counsellor.name}` : counsellor.name;

    await Notification.create({
      studentId: student._id,
      counsellorId: counsellor._id,
      counsellorName,
      targetRole: "student",
      type: "cancellation",
      title: "Appointment Cancelled",
      message: `Your session on ${getPastDateStr(spec.daysAgo)} at ${spec.time} with ${counsellorName} was cancelled.`,
      apologyNote: spec.reason,
      date: getPastDateStr(spec.daysAgo),
      time: spec.time,
      readBy: [student.userId],
      createdAt: nTime,
      updatedAt: nTime,
    });
    notificationsCount++;
  }
  console.log(`[Historical Seed] Inserted ${notificationsCount} historical notifications.`);

  // 8. WELLNESS FAQ SEEDING
  await WellnessFAQ.insertMany(wellnessQAData);
  console.log(`[Historical Seed] Inserted ${wellnessQAData.length} Wellness FAQ entries.`);

  console.log("\n========================================================");
  console.log("[Historical Seed] SEEDING COMPLETE SUCCESSFULLY!");
  console.log("========================================================");
  console.log(`- Date Range Used: ${getPastDateStr(55)} to ${getPastDateStr(1)} (strictly BEFORE today)`);
  console.log(`- Students & Counsellors: 5 Students, 5 Counsellors`);
  console.log(`- Wellness Records Added: ${totalAssessmentsCount}`);
  console.log(`- Appointments Added: ${createdAppointments.length} (${completedAppointmentsCount} Completed, ${createdAppointments.length - completedAppointmentsCount} Cancelled)`);
  console.log(`- Feedback/Ratings Added: ${feedbackCount}`);
  console.log(`- Conversations/Messages Added: ${conversationsCount} Conversations, ${chatMessagesCount} Messages`);
  console.log(`- Notifications Added: ${notificationsCount}`);
  console.log("========================================================\n");

  return {
    dateRange: `${getPastDateStr(55)} to ${getPastDateStr(1)}`,
    studentsCount: students.length,
    counsellorsCount: counsellors.length,
    assessmentsCount: totalAssessmentsCount,
    appointmentsCount: createdAppointments.length,
    feedbackCount,
    conversationsCount,
    chatMessagesCount,
    notificationsCount,
  };
}

// Standalone execution
if (require.main === module) {
  const { connectDB, disconnectDB } = require("../backend/config/db");
  (async () => {
    await connectDB();
    await seedHistoricalData();
    await disconnectDB();
  })().catch((err) => {
    console.error("Historical seeding failed:", err);
    process.exit(1);
  });
}

module.exports = { seedHistoricalData };
