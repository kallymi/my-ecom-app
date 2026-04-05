const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { logoutCookieOptions } = require("../config/cookies");
/* ===============================
   EXTRACTION TOKEN (ACCESS TOKEN ONLY)
================================ */
const extractToken = (req) => {
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

/* ===============================
   PROTECT — Auth utilisateur
================================ */
const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: "Non autorisé" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 💡 Astuce Pro : On ne sélectionne que le nécessaire pour valider la session
    const user = await User.findById(decoded.id).select("+passwordChangedAt isBlocked isDeleted role");

    if (!user || user.isDeleted || user.isBlocked) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ success: false, message: "Session expirée (mot de passe modifié)" });
    }

    // On attache l'user à la requête
    req.user = user;
    next();
  } catch (error) {
   if (error.name === "TokenExpiredError") {
      // Si expiration, on demande un rafraîchissement du token au front
      return res.status(401).json({ success:false, message:"Token expiré" });
    }
    // Sinon, token invalide : on supprime le refresh token pour déconnecter
    res.clearCookie("refreshToken", logoutCookieOptions);
    return res.status(401).json({ success:false, message:"Session invalide" });
  }
};
/* ===============================
   ADMIN
================================ */
const admin = (req, res, next) => {
  // Simple et efficace
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Réservé aux administrateurs" });
};

/* ===============================
   PROTECT OPTIONAL
================================ */
const protectOptional = async (req, res, next) => {
  try {
    const token = extractToken(req);

    // 1. Si pas de token, on passe direct au controller (Mode Guest)
    if (!token) {
      return next(); 
    }

    // 2. Vérification du Token
    // On utilise un try/catch INTERNE pour que l'erreur de JWT ne stoppe pas le middleware
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // 3. Recherche utilisateur avec une limite de temps (maxTimeMS)
      const user = await User.findById(decoded.id)
        .select("-password")
        .lean()
        .maxTimeMS(1000); // Si la BDD met + d'une seconde, on abandonne l'auth

      if (user && !user.isDeleted && !user.isBlocked) {
        req.user = user;
      }
    } catch (jwtOrDbError) {
      console.error("⚠️ Auth Optionnelle échouée (on continue en Guest):", jwtOrDbError.message);
      // On ne fait rien, on laisse req.user vide
    }

    // 4. Quoi qu'il arrive, on appelle next()
    next();

  } catch (criticalError) {
    // Sécurité ultime : si tout explose, on laisse quand même passer la commande
    console.error("🚨 Erreur critique protectOptional:", criticalError);
    next();
  }
};

// module.exports = { protect, protectOptional, admin };
// module.exports = { protect, protectOptional: async (req, res, next) => { /* ... */ }, admin };
module.exports = { protect, protectOptional, admin };