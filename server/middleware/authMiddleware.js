const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

/* ===============================
   PROTECT — Auth utilisateur
   =============================== */
const protect = async (req, res, next) => {
  let token;

  // 1. Vérifier la présence du token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Non autorisé — token manquant",
    });
  }

  try {
    // 2. Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Récupérer l'utilisateur
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // 4. Bloquer compte supprimé / désactivé
    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Compte désactivé",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Compte bloqué par l’administrateur",
      });
    }

    // 5. Injecter l’utilisateur dans req
    req.user = user;
    user.lastActive = Date.now();
    await user.save();
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré",
    });
  }
};

/* ===============================
   ADMIN — Accès admin uniquement
   =============================== */
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Accès refusé — Administrateur requis",
  });
};

/* ==================
    Accès Optionnel 
   ================== */

const protectOptional = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      req.user = null;
    }
  }
  
  
  next();
};

module.exports = { protectOptional, protect, admin };
