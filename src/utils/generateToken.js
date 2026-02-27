const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function generateEmailVerificationToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    purpose: 'verify_email',
  };

  return jwt.sign(payload, process.env.EMAIL_VERIFY_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.EMAIL_VERIFY_EXPIRES_IN || '1d',
  });
}

function generatePasswordResetToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    purpose: 'reset_password',
  };

  return jwt.sign(payload, process.env.RESET_PASSWORD_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN || '1h',
  });
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

module.exports = {
  generateAccessToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyToken,
};

