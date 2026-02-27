const nodemailer = require('nodemailer');

const apiResponse = require('./apiResponse');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  if (!from) {
    throw new Error('EMAIL_FROM or SMTP_USER must be configured');
  }

  const transport = getTransporter();

  const info = await transport.sendMail({
    from,
    to,
    subject,
    html,
  });

  return info;
}

function buildVerificationEmail(user, token) {
  const appUrl = process.env.APP_URL || 'http://localhost:4000';
  const verifyUrl = `${appUrl}/api/auth/verify-email/${token}`;

  const subject = 'Verify your email - Local for Vocal';
  const html = `
    <p>Hi ${user.name},</p>
    <p>Thank you for registering on <strong>Local for Vocal – Visakhapatnam Artisans Platform</strong>.</p>
    <p>Please click the link below to verify your email address:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>If you did not create this account, you can safely ignore this email.</p>
  `;

  return { subject, html };
}

function buildResetPasswordEmail(user, token) {
  const appUrl = process.env.APP_URL || 'http://localhost:4000';
  const resetUrl = `${appUrl}/api/auth/reset-password/${token}`;

  const subject = 'Reset your password - Local for Vocal';
  const html = `
    <p>Hi ${user.name},</p>
    <p>We received a request to reset your password on <strong>Local for Vocal – Visakhapatnam Artisans Platform</strong>.</p>
    <p>Please click the link below to reset your password:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
  `;

  return { subject, html };
}

async function sendVerificationEmail(user, token) {
  const { subject, html } = buildVerificationEmail(user, token);
  return sendEmail({ to: user.email, subject, html });
}

async function sendResetPasswordEmail(user, token) {
  const { subject, html } = buildResetPasswordEmail(user, token);
  return sendEmail({ to: user.email, subject, html });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  buildVerificationEmail,
  buildResetPasswordEmail,
  apiResponse,
};

