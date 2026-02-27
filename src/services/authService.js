const bcrypt = require('bcrypt');

const prisma = require('../prisma/client');
const {
  generateAccessToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyToken,
} = require('../utils/generateToken');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/email');

const SALT_ROUNDS = 10;

async function register({ name, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
    },
  });

  const token = generateEmailVerificationToken(user);
  await sendVerificationEmail(user, token);

  const { password: _, ...safeUser } = user;
  return safeUser;
}

async function verifyEmailToken(token) {
  let decoded;
  try {
    decoded = verifyToken(token, process.env.EMAIL_VERIFY_SECRET || process.env.JWT_SECRET);
  } catch (e) {
    const error = new Error('Invalid or expired verification token');
    error.statusCode = 400;
    throw error;
  }

  if (decoded.purpose !== 'verify_email') {
    const error = new Error('Invalid verification token');
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.update({
    where: { id: decoded.id },
    data: { isVerified: true },
  });

  const { password, ...safeUser } = user;
  return safeUser;
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isVerified) {
    const error = new Error('Please verify your email before logging in');
    error.statusCode = 403;
    throw error;
  }

  const token = generateAccessToken(user);
  const { password: _, ...safeUser } = user;

  return { token, user: safeUser };
}

async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Do not reveal whether email exists
    return;
  }

  const token = generatePasswordResetToken(user);
  await sendResetPasswordEmail(user, token);
}

async function resetPasswordWithToken(token, newPassword) {
  let decoded;
  try {
    decoded = verifyToken(token, process.env.RESET_PASSWORD_SECRET || process.env.JWT_SECRET);
  } catch (e) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  if (decoded.purpose !== 'reset_password') {
    const error = new Error('Invalid reset token');
    error.statusCode = 400;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: decoded.id },
    data: { password: hashed },
  });
}

module.exports = {
  register,
  verifyEmailToken,
  login,
  requestPasswordReset,
  resetPasswordWithToken,
};

