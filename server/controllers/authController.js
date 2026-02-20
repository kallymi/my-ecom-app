const crypto = require('crypto');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');

/* =========================
   JWT
========================= */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/* =========================
   REGISTER (avec OTP)
========================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const otp = generateOTP();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      otp: hashedOtp,
      otpExpiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    await sendEmail({
      to: email,
      subject: 'Code de vérification',
      text: `Votre code de vérification est : ${otp}`
    });

    res.status(201).json({
      message: 'Compte créé. Vérifiez votre email avec le code OTP.'
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};


/* =========================
   VERIFY OTP
========================= */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      otp: hashedOtp,
      otpExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'OTP invalide ou expiré' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({
      message: 'Compte vérifié avec succès',
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Veuillez vérifier votre email' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    res.json({
      token: generateToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   FORGOT PASSWORD (OTP)
========================= */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  const otp = generateOTP();
  user.otp = crypto.createHash('sha256').update(otp).digest('hex');
  user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail({
    to: email,
    subject: 'Réinitialisation du mot de passe',
    text: `Votre code OTP est : ${otp}`
  });

  res.json({ message: 'OTP envoyé par email' });
};

/* =========================
   RESEND OTP
========================= */
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Compte déjà vérifié' });
    }

    const otp = generateOTP();
    user.otp = crypto.createHash('sha256').update(otp).digest('hex');
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: email,
      subject: 'Nouveau code de vérification',
      text: `Votre nouveau code OTP est : ${otp}`
    });

    res.json({ message: 'Nouveau code OTP envoyé' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* =========================
   RESET PASSWORD
========================= */

exports.resetPassword = async (req, res) => {
  const { otp, password } = req.body;

  if (!otp || !password) {
    return res.status(400).json({ message: "OTP et mot de passe requis" });
  }

  const hashedOtp = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  console.log("OTP reçu:", otp);
  console.log("OTP hashé:", hashedOtp);

  const user = await User.findOne({
    otp: hashedOtp,
    otpExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "OTP invalide ou expiré" });
  }

  user.password = password;
  user.otp = undefined;
  user.otpExpiresAt = undefined;

  await user.save();

  res.json({ message: "Mot de passe réinitialisé avec succès" });
};



