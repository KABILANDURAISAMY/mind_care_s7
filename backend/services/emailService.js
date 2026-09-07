const nodemailer = require("nodemailer");

/**
 * Lazily creates a transporter only if SMTP credentials are configured.
 * If they're not set, sendEmail() silently no-ops so the rest of the
 * app (booking, cancellation, etc.) keeps working in local development
 * without requiring a real mail server, per the spec's "optional" note.
 */
let transporter = null;

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t || !to) {
    console.log(`[email disabled] Would have sent "${subject}" to ${to}`);
    return;
  }

  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || "MindCare <no-reply@mindcare.edu>",
      to,
      subject,
      html,
    });
  } catch (error) {
    // Email failures must never break the underlying booking/cancellation flow.
    console.error("Email send failed:", error.message);
  }
};

const templates = {
  bookingConfirmedForStudent: (appt, counsellorName) => ({
    subject: "Appointment Confirmed - MindCare",
    html: `<p>Hi ${appt.studentName},</p>
      <p>Your appointment with <strong>${counsellorName}</strong> is confirmed for
      <strong>${appt.date} at ${appt.time}</strong>.</p>
      <p>Reason: ${appt.issue}</p>
      <p>You can cancel up to 20 minutes before the scheduled time from "My Appointments".</p>`,
  }),
  newBookingForCounsellor: (appt) => ({
    subject: "New Student Appointment - MindCare",
    html: `<p>A new appointment has been booked.</p>
      <p>Student: ${appt.studentName} (${appt.department}, ${appt.rollNumber})</p>
      <p>Date: ${appt.date} at ${appt.time}</p>
      <p>Reason: ${appt.issue}</p>`,
  }),
  cancellationNotice: (appt, who) => ({
    subject: "Appointment Cancelled - MindCare",
    html: `<p>The appointment on <strong>${appt.date} at ${appt.time}</strong> has been cancelled by ${who}.</p>`,
  }),
};

module.exports = { sendEmail, templates };
