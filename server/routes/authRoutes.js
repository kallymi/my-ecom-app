const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  register,
  logout,
  login,
  verifyOtp,
  getMe,
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

// cookie
router.get('/logout', logout);

// 🔐 Route PROTÉGÉE (nécessite le cookie token)
router.get('/me', protect, getMe); // On utilise /me car le router est déjà /api/auth


module.exports = router;
