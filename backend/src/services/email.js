import nodemailer from 'nodemailer';
import env from '../config/env.js';

// A single transporter is created only when SMTP is configured. Without it,
// email sending becomes a no-op so the app still works (codes are shown to
// the admin instead).
let transporter = null;
if (env.smtp.host) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  });
}

export function emailEnabled() {
  return transporter != null;
}

/**
 * Send an email if SMTP is configured. Returns true if sent, false if skipped.
 * Never throws on delivery problems — email is best-effort.
 */
export async function sendEmail({ to, subject, text }) {
  if (!transporter) return false;
  try {
    await transporter.sendMail({ from: env.smtp.from, to, subject, text });
    return true;
  } catch (err) {
    if (!env.isTest) console.error('Email send failed:', err.message);
    return false;
  }
}
