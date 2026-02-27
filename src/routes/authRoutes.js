const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  authController.registerValidation,
  authController.register
);

router.get('/verify-email/:token', authController.verifyEmail);

router.post(
  '/login',
  authController.loginValidation,
  authController.login
);

router.post(
  '/forgot-password',
  authController.forgotPasswordValidation,
  authController.forgotPassword
);

router.post(
  '/reset-password/:token',
  authController.resetPasswordValidation,
  authController.resetPassword
);

module.exports = router;

