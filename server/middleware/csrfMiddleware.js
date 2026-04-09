exports.verifyCSRF = (req, res, next) => {
  const csrfCookie = req.cookies.csrfToken;
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({
      success: false,
      message: "CSRF token manquant"
    });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({
      success: false,
      message: "CSRF token invalide"
    });
  }

  next();
};