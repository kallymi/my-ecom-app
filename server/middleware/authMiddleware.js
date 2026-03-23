const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

/* ===============================
   EXTRACTION TOKEN
================================ */
const extractToken = (req) => {
  // Priorité au cookie (plus sécurisé pour le web)
  if (req.cookies?.token) return req.cookies.token;
  
  // Alternative via Header (pour applications mobiles ou tests Postman)
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
    return res.status(401).json({
      success: false,
      message: "Non autorisé — session manquante",
    });
  }

  try {
    // 1. Vérification JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Récupération user (on exclut le password d'office)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé ou compte supprimé",
      });
    }

    // 3. Sécurité statut du compte
    if (user.isDeleted || user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: user.isBlocked ? "Votre compte est bloqué" : "Ce compte n'existe plus",
      });
    }

    // 4. Sécurité password changé (Invalidation des anciens tokens)
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      
      // Si le token a été émis AVANT le changement de mot de passe
      if (decoded.iat < changedTimestamp) {
        throw new Error("PasswordChanged");
      }
    }

    // 5. Injection user pour les prochains middlewares
    req.user = user;
    next();

  } catch (error) {
    let message = "Session invalide";

    if (error.name === "TokenExpiredError") {
      message = "Votre session a expiré, veuillez vous reconnecter";
    } else if (error.name === "JsonWebTokenError") {
      message = "Token de sécurité invalide";
    } else if (error.message === "PasswordChanged") {
      message = "Mot de passe modifié récemment. Reconnectez-vous.";
    }

    // Nettoyage du cookie systématique en cas d'erreur de session
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

/* ===============================
   ADMIN — Accès restreint
================================ */
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Accès refusé — Droits administrateur requis",
  });
};

/* ===============================
   PROTECT OPTIONAL 
   (Utile pour voir le panier ou prix sans être forcé de se logger)
================================ */
const protectOptional = async (req, res, next) => {
  const token = extractToken(req);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // .lean() rend la requête plus légère car elle ne crée pas d'instance Mongoose complète
      const user = await User.findById(decoded.id).select("-password").lean();

      if (user && !user.isDeleted && !user.isBlocked) {
        req.user = user;
      }
    } catch (err) {
      // On ignore l'erreur en optionnel, req.user restera undefined
    }
  }

  next();
};

module.exports = { protect, protectOptional, admin };