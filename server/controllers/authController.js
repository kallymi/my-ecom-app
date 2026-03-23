const crypto = require('crypto');
const bcrypt = require("bcryptjs"); // Inutile ici si le hachage se fait dans le modèle (pre-save hook)
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');

/* =========================
   JWT & COOKIES
========================= */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: false, // ⚠️ IMPORTANT en local (IP)
    sameSite: 'lax',
    path: '/',
  };
};

/* =========================
   JWT & COOKIES
========================= */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user);

  const options = getCookieOptions();

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};

/* =========================
    REGISTER
========================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const otp = generateOTP();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.create({
      name,
      email: cleanEmail,
      password, // Sera haché par le pre('save') hook du User model
      isVerified: false,
      otp: hashedOtp,
      otpExpiresAt: Date.now() + 10 * 60 * 1000 
    });

    try {
      await sendEmail({
        to: cleanEmail,
        subject: 'Code de vérification',
        text: `Votre code de vérification est : ${otp}`
      });
    } catch (mailError) {
      console.error("Erreur d'envoi d'email:", mailError);
    }

    return res.status(201).json({
      success: true,
      message: 'Compte créé. Vérifiez votre email avec le code OTP.'
    });

  } catch (error) {
    console.error("Erreur Register:", error);
    return res.status(500).json({ 
        success: false,
        message: "Erreur lors de l'inscription",
        error: error.message 
    });
  }
};

/* =========================
   GET ME (Récupérer profil)
========================= */
exports.getMe = async (req, res) => {
  try {
    // 🛡️ CRITIQUE : Empêche le navigateur (surtout sur IP réseau) 
    // de mettre en cache cette réponse de session.
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.status(200).json({
      success: true,
      user: req.user // req.user est rempli par ton middleware de protection (protect)
    });
  } catch (error) {
    console.error("Erreur GetMe:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération du profil" 
    });
  }
};

/* =========================
   VERIFY OTP
========================= */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email et OTP requis' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email: cleanEmail,
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

    sendTokenResponse(user, 200, res, 'Compte vérifié avec succès');
  } catch (error) {
    console.error("Erreur Verify OTP:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Veuillez fournir un email et un mot de passe' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Veuillez vérifier votre email' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants incorrects, vérifiez votre email ou password' });
    }

    sendTokenResponse(user, 200, res, 'Connexion réussie');
  } catch (error) {
    console.error("Erreur Login:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* =========================
   LOGOUT
========================= */
exports.logout = async (req, res) => {
  const options = getCookieOptions();

  res.cookie('token', '', {
    options,
    expires: new Date(0)
    
  });

  res.status(200).json({ 
    success: true, 
    message: "Déconnexion réussie" 
  });
};

/* =========================
   FORGOT PASSWORD
========================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "L'email est requis" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const otp = generateOTP();
    user.otp = crypto.createHash('sha256').update(otp).digest('hex');
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // Valide 10 minutes
    await user.save();

    await sendEmail({
      to: cleanEmail,
      subject: 'Réinitialisation du mot de passe',
      text: `Votre code OTP est : ${otp}`
    });

    res.json({ success: true, message: 'OTP envoyé par email' });
  } catch (error) {
    console.error("Erreur Forgot Password:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* =========================
   RESEND OTP
========================= */
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "L'email est requis" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

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
      to: cleanEmail,
      subject: 'Nouveau code de vérification',
      text: `Votre nouveau code OTP est : ${otp}`
    });

    res.json({ success: true, message: 'Nouveau code OTP envoyé' });
  } catch (error) {
    console.error("Erreur Resend OTP:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/* =========================
   RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {
  try {
    const { otp, password, email } = req.body;

    if (!otp || !password || !email) {
      return res.status(400).json({ message: "Email, OTP et mot de passe requis" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email: cleanEmail,
      otp: hashedOtp,
      otpExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "OTP invalide ou expiré" });
    }

    // Le hachage du mot de passe doit être géré par votre middleware pre('save') dans le userModel
    user.password = password; 
    
    // Nettoyage des champs OTP
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    });

  } catch (error) {
    console.error("Erreur Reset Password:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};