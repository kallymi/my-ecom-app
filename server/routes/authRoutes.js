const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  register,
  logout,
  login,
  verifyOtp,
  googleAuth,
  facebookAuth,
  getMe,
  resendOtp,
  refreshToken,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { verifyCSRF } = require('../middleware/authMiddleware');

// 🔐 Inscription
router.post('/register', register);

// ✅ Vérification OTP
router.post('/verify-otp', verifyOtp);

// 🔁 Renvoyer OTP
router.post('/resend-otp', resendOtp);

// 🔓 Connexion
router.post('/login', login);

// 🔁 REFRESH TOKEN (🔥 NOUVEAU)
router.post('/refresh', verifyCSRF, refreshToken);

// 🌐 Authentification Google (Route Publique)
router.post('/google', googleAuth);

// 🌐 Authentification Facebook (Route Publique)
router.post('/facebook', facebookAuth );

// 🔑 Mot de passe oublié
router.post('/forgot-password', forgotPassword);

// 🔄 Reset mot de passe
router.post('/reset-password', resetPassword);

// 🚪 Logout
router.post('/logout', verifyCSRF, logout);

// 🔐 Route PROTÉGÉE (nécessite accessToken)
router.get('/me', protect, getMe);

module.exports = router;