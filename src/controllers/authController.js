const { body } = require('express-validator');

const apiResponse = require('../utils/apiResponse');
const validateRequest = require('../middleware/validateRequest');
const authService = require('../services/authService');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['CUSTOMER', 'ARTISAN', 'ADMIN', 'customer', 'artisan', 'admin'])
    .withMessage('Invalid role'),
  validateRequest,
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
];

const forgotPasswordValidation = [body('email').isEmail().withMessage('Valid email is required'), validateRequest];

const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validateRequest,
];

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const normalizedRole = role
      ? role.toUpperCase()
      : 'CUSTOMER';

    const allowedRoles = ['CUSTOMER', 'ARTISAN', 'ADMIN'];

    const finalRole = allowedRoles.includes(normalizedRole) ? normalizedRole : 'CUSTOMER';

    const user = await authService.register({
      name,
      email,
      password,
      role: finalRole,
    });

    return res
      .status(201)
      .json(apiResponse(true, 'Registration successful. Please verify your email.', { user }));
  } catch (error) {
    return next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;
    const user = await authService.verifyEmailToken(token);
    return res.json(apiResponse(true, 'Email verified successfully', { user }));
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return res.json(apiResponse(true, 'Login successful', result));
  } catch (error) {
    return next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    return res.json(
      apiResponse(true, 'If an account with that email exists, a reset link has been sent', null)
    );
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    await authService.resetPasswordWithToken(token, password);
    return res.json(apiResponse(true, 'Password reset successful', null));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
};

