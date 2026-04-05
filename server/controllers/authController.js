const axios = require('axios'); // Assure-toi d'avoir axios côté backend
const crypto = require("crypto");

const { OAuth2Client } = require("google-auth-library");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { refreshCookieOptions, logoutCookieOptions } = require("../config/cookies");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const sendEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOTP");

// Initialisation du client Google
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



/* =========================
   UTILITAIRE : FORMATTER LA RÉPONSE
========================= */
const sendAuthResponse = async (user, statusCode, res, message) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Mise à jour atomique : on ajoute le nouveau et on garde les 5 derniers
  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        $each: [refreshToken],
        $slice: -5 
      }
    }
  });

  res.status(statusCode)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .json({
      success: true,
      message,
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
        phone: user.phone,
        neighborhood: user.neighborhood,
      },
    });
};

/* =========================
   1. REGISTER (Async Mode)
========================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Nettoyage de l'email pour éviter les doublons dus aux espaces ou majuscules
    const cleanEmail = email?.toLowerCase().trim();

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email: cleanEmail });

    // Cas 1 : L'utilisateur existe et est déjà vérifié
    if (user && user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "Cet email est déjà utilisé et le compte est vérifié." 
      });
    }

    // Cas 2 : Génération de l'OTP
    const otp = generateOTP(); 
    const otpString = String(otp).trim(); // On s'assure que c'est une String
    
    // Hachage SHA256 (doit être identique à celui de verifyOtp)
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otpString)
      .digest("hex");

    // Expiration dans 10 minutes
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    if (user && !user.isVerified) {
      // Mise à jour de l'utilisateur existant non-vérifié
      user.name = name;
      user.password = password; // Sera haché par le middleware pre('save')
      user.otp = hashedOtp;
      user.otpExpiresAt = otpExpiresAt;
      
      await user.save(); // Déclenche le middleware async pre('save')
    } else {
      // Création d'un nouvel utilisateur (non vérifié par défaut)
      user = await User.create({
        name,
        email: cleanEmail,
        password,
        isVerified: false,
        otp: hashedOtp,
        otpExpiresAt,
      });
    }

    // Envoyer l'OTP CLAIR par email
    await sendEmail({
      to: cleanEmail,
      subject: "Vérification de votre compte",
      text: `Votre code de vérification est : ${otpString}. Il expire dans 10 minutes.`,
    });

    console.log(`📧 OTP envoyé à ${cleanEmail} (Hash: ${hashedOtp.substring(0, 10)}...)`);

    res.status(200).json({ 
      success: true, 
      message: "Un code de vérification a été envoyé sur votre adresse email." 
    });

  } catch (error) {
    console.error("💥 Erreur Register:", error);
    res.status(500).json({ 
      success: false, 
      message: "Une erreur est survenue lors de l'inscription." 
    });
  }
};
/* =========================
   2. VERIFY OTP
========================= */
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const cleanEmail = email.toLowerCase().trim();
//     console.log("📥 OTP reçu du frontend :", typeof otp, `"${otp}"`);

//     // const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
//     const cleanOtpReceived = String(otp).trim();
//     const hashedOtp = crypto.createHash("sha256").update(cleanOtpReceived).digest("hex");
//     console.log("DEBUG VERIFICATION :");
//     console.log("- Email cherché :", cleanEmail);
//     console.log("- Hash généré à l'instant :", hashedOtp);
    
//     // On cherche l'utilisateur juste par email pour voir ce qu'il a en base
//     const userCheck = await User.findOne({ email: cleanEmail }).select("+otp +otpExpiresAt");
    
//     if (userCheck) {
//         console.log("- Hash stocké en BDD :", userCheck.otp);
//         console.log("- OTP expiré ? :", userCheck.otpExpiresAt < Date.now());
//     } else {
//         console.log("- Aucun utilisateur trouvé avec cet email");
//     }


//     const user = await User.findOne({
//       email: cleanEmail,
//       otp: hashedOtp,
//       otpExpiresAt: { $gt: Date.now() },
//     });

//     if (!user) {
//       console.log("❌ Échec : OTP introuvable ou expiré dans la BDD !");
//       return res.status(400).json({ success: false, message: "OTP invalide ou expiré." });
//     }

//     user.isVerified = true;
//     user.otp = undefined;
//     user.otpExpiresAt = undefined;

//     // Envoie la réponse avec les tokens
//     await sendAuthResponse(user, 200, res, "Compte vérifié avec succès.");
//   } catch (error) {
//     console.error("Erreur Verify OTP:", error);
//     res.status(500).json({ success: false, message: "Erreur serveur." });
//   }
// };
/* =========================
    2. VERIFY OTP (Async Mode)
========================= */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Nettoyage strict des entrées
    const cleanEmail = email?.toLowerCase().trim();
    const cleanOtpReceived = String(otp).trim();

    // 2. Génération du hash pour la comparaison
    const hashedOtp = crypto
      .createHash("sha256")
      .update(cleanOtpReceived)
      .digest("hex");

    // 3. Recherche de l'utilisateur
    // On force la sélection de otp et otpExpiresAt car ils sont souvent "select: false"
    const user = await User.findOne({
      email: cleanEmail,
      otp: hashedOtp
    }).select("+otp +otpExpiresAt");

    // 4. Vérification de l'existence
    if (!user) {
      console.log(`❌ Échec : Aucun utilisateur trouvé pour ${cleanEmail} avec ce hash.`);
      return res.status(400).json({ 
        success: false, 
        message: "Code OTP incorrect ou email invalide." 
      });
    }

    // 5. Vérification de l'expiration (comparaison d'objets Date)
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      console.log(`❌ Échec : OTP expiré pour ${cleanEmail}`);
      return res.status(400).json({ 
        success: false, 
        message: "Le code OTP a expiré. Veuillez en demander un nouveau." 
      });
    }

    // 6. Mise à jour de l'utilisateur (Async)
    user.isVerified = true;
    user.otp = undefined;          // On supprime le code après usage
    user.otpExpiresAt = undefined; // On supprime l'expiration
    
    await user.save(); // Déclenche le middleware 'save' asynchrone de ton modèle

    // 7. Réponse finale avec génération de Tokens
    console.log(`✅ Succès : Compte vérifié pour ${cleanEmail}`);
    await sendAuthResponse(user, 200, res, "Votre compte a été vérifié avec succès.");

  } catch (error) {
    console.error("💥 Erreur Critique Verify OTP:", error);
    res.status(500).json({ 
      success: false, 
      message: "Une erreur interne est survenue lors de la vérification." 
    });
  }
};
/* =========================
   3. LOGIN CLASSIQUE
========================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user || !user.isVerified) {
      return res.status(401).json({ success: false, message: "Identifiants invalides ou compte non vérifié." });
    }

    if (user.isBlocked || user.isDeleted) {
      return res.status(403).json({ success: false, message: "Accès refusé au compte." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Identifiants invalides." });
    }

    await sendAuthResponse(user, 200, res, "Connexion réussie.");
  } catch (error) {
    console.error("Erreur Login:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la connexion." });
  }
};

/* =========================
   4. GOOGLE AUTH (OAUTH2)
========================= */
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body; // L'access_token envoyé par le frontend

    if (!token) {
      return res.status(400).json({ success: false, message: "Token Google manquant." });
    }

    // Récupération des infos utilisateur via l'API Google
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );

    const { email, name, picture, sub } = googleRes.data;
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Création automatique si le compte n'existe pas
      user = await User.create({
        name,
        email: cleanEmail,
        googleId: sub,
        password: crypto.randomBytes(20).toString("hex"), // Mot de passe aléatoire sécurisé
        isVerified: true,
        avatar: picture,
      });
    } else {
      if (user.isBlocked || user.isDeleted) {
        return res.status(403).json({ success: false, message: "Compte suspendu ou supprimé." });
      }
      // Mise à jour de l'avatar au cas où il a changé sur Google
      user.avatar = picture;
      await user.save({ validateBeforeSave: false });
    }

    // Génération des tokens et réponse (Ta fonction utilitaire)
    await sendAuthResponse(user, 200, res, "Connexion Google réussie.");

  } catch (error) {
    console.error("Erreur Google Auth détaillée:", error.response?.data || error.message);
    res.status(401).json({ success: false, message: "L'authentification Google a échoué." });
  }
};

/* =========================
   5. REFRESH TOKEN (Rotation & Sécurité Pro)
========================= */
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Session expirée." });
  }

  try {
    // 1. On décode le token pour avoir l'ID
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // 2. CRUCIAL : On ajoute .select("+refreshTokens") car il est caché par défaut
    const user = await User.findById(decoded.id).select("+refreshTokens");

    if (!user || user.isDeleted || user.isBlocked) {
      return res.status(401).json({ success: false, message: "Utilisateur invalide." });
    }

    // 3. SECURISATION : On vérifie si le tableau existe, sinon on prend un tableau vide
    const currentTokens = user.refreshTokens || [];

    // 🛡️ REUSE DETECTION (Détection de vol)
    if (!currentTokens.includes(token)) {
      user.refreshTokens = []; // On vide tout
      await user.save({ validateBeforeSave: false });
      res.clearCookie("refreshToken", refreshCookieOptions);
      return res.status(403).json({ success: false, message: "Alerte sécurité." });
    }

    // 4. On vérifie le mot de passe
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ success: false, message: "Reconnectez-vous." });
    }

    // 5. ROTATION : On enlève l'ancien et on met le nouveau
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // On filtre pour enlever le token actuel
    user.refreshTokens = currentTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    
    await user.save({ validateBeforeSave: false });

    // 6. On renvoie le nouveau cookie
    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);
    res.status(200).json({ success: true, accessToken: newAccessToken });

  } catch (error) {
    console.error("Erreur Refresh:", error);
    return res.status(401).json({ success: false, message: "Token expiré." });
  }
};

/* =========================
   6. LOGOUT (Invalidation réelle)
========================= */
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // 1. Invalidation en BDD
      await User.updateOne(
        { refreshTokens: token },
        { $pull: { refreshTokens: token } }
      );
    }

    // 2. Suppression du cookie avec les options strictes
    res.clearCookie("refreshToken", logoutCookieOptions);

    return res.status(200).json({ success: true, message: "Déconnexion réussie." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la déconnexion." });
  }
};

/* =========================
   7. FORGOT PASSWORD
========================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail, isVerified: true });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable ou non vérifié." });
    }

    const otp = generateOTP();
    user.otp = crypto.createHash("sha256").update(otp).digest("hex");
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: cleanEmail,
      subject: "Réinitialisation de votre mot de passe",
      text: `Votre code OTP pour réinitialiser votre mot de passe est : ${otp}`,
    });

    res.status(200).json({ success: true, message: "Instructions envoyées par email." });
  } catch (error) {
    console.error("Erreur Forgot Password:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

/* =========================
   8. RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email: cleanEmail,
      otp: hashedOtp,
      otpExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "OTP invalide ou expiré." });
    }

    user.password = password; // Hachage géré par le pre-save hook
    user.passwordChangedAt = Date.now();
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    
    // Option de sécurité pro : vider les refreshTokens existants pour déconnecter les autres appareils
    user.refreshTokens = []; 

    await user.save();

    res.status(200).json({ success: true, message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur Reset Password:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

/* =========================
   9. RESEND OTP
========================= */
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    if (user.isVerified) return res.status(400).json({ success: false, message: "Ce compte est déjà vérifié." });

    const otp = generateOTP();
    user.otp = crypto.createHash("sha256").update(otp).digest("hex");
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: cleanEmail,
      subject: "Nouveau code de vérification",
      text: `Votre nouveau code OTP est : ${otp}`,
    });

    res.status(200).json({ success: true, message: "Nouveau code envoyé." });
  } catch (error) {
    console.error("Erreur Resend OTP:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

/* =========================
   10. GET ME
========================= */
exports.getMe = async (req, res) => {
  try {
    // L'utilisateur est déjà attaché à req grâce au middleware 'protect'
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};
