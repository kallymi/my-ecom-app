const isProd = process.env.NODE_ENV === "production";

exports.refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  // "none" nécessite impérativement "secure: true" (donc HTTPS)
  sameSite: isProd ? "none" : "lax", 
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};

// Option pour le logout (on retire le maxAge car on veut supprimer le cookie)
exports.logoutCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
};