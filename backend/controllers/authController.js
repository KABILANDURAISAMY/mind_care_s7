const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Student = require("../models/Student");
const Counsellor = require("../models/Counsellor");
const generateToken = require("../utils/generateToken");
const { isValidEmail, isNonEmptyString } = require("../utils/validators");

const SALT_ROUNDS = 10;

/* ------------------------------------------------------------------ */
/* Student                                                             */
/* ------------------------------------------------------------------ */

// POST /api/auth/student/register
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, rollNumber, department, year, phone } = req.body;

    if (
      !isNonEmptyString(name) ||
      !isValidEmail(email) ||
      !isNonEmptyString(password) ||
      !isNonEmptyString(rollNumber) ||
      !isNonEmptyString(department) ||
      !isNonEmptyString(year) ||
      !isNonEmptyString(phone)
    ) {
      return res.status(400).json({ message: "All fields are required and must be valid." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const existingRoll = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existingRoll) {
      return res.status(409).json({ message: "This roll number is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "student",
    });

    const student = await Student.create({
      userId: user._id,
      name,
      email: email.toLowerCase(),
      rollNumber: rollNumber.toUpperCase(),
      department,
      year,
      phone,
    });

    const token = generateToken(user._id, "student");

    res.status(201).json({
      message: "Student account created successfully.",
      token,
      user: { id: user._id, name: student.name, email: student.email, role: "student", profile: student },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/student/login
const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: "student" }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const student = await Student.findOne({ userId: user._id });
    const token = generateToken(user._id, "student");

    res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: "student", profile: student },
    });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Counsellor                                                          */
/* ------------------------------------------------------------------ */

// POST /api/auth/counsellor/register
const registerCounsellor = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, qualification, specialization, experience, phone } = req.body;

    if (
      !isNonEmptyString(name) ||
      !isValidEmail(email) ||
      !isNonEmptyString(password) ||
      !isNonEmptyString(qualification) ||
      !isNonEmptyString(specialization) ||
      experience === undefined ||
      experience === null ||
      !isNonEmptyString(phone)
    ) {
      return res.status(400).json({ message: "All fields are required and must be valid." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "counsellor",
    });

    const counsellor = await Counsellor.create({
      userId: user._id,
      name,
      email: email.toLowerCase(),
      qualification,
      specialization,
      experience: Number(experience),
      phone,
    });

    const token = generateToken(user._id, "counsellor");

    res.status(201).json({
      message: "Counsellor account created successfully.",
      token,
      user: { id: user._id, name: counsellor.name, email: counsellor.email, role: "counsellor", profile: counsellor },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/counsellor/login
const loginCounsellor = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: "counsellor" }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const counsellor = await Counsellor.findOne({ userId: user._id });
    const token = generateToken(user._id, "counsellor");

    res.json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: "counsellor", profile: counsellor },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerStudent, loginStudent, registerCounsellor, loginCounsellor };
