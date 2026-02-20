const express = require('express');
const router = express.Router();

const {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// 🔐 Inscription
router.post('/register', register);

// ✅ Vérification OTP
router.post('/verify-otp', verifyOtp);

// 🔁 Renvoyer OTP
router.post('/resend-otp', resendOtp);

// 🔓 Connexion
router.post('/login', login);

// 🔑 Mot de passe oublié
router.post('/forgot-password', forgotPassword);

// 🔄 Reset mot de passe
router.post('/reset-password', resetPassword);

module.exports = router;
