const csrfToken = generateCSRFToken();

res.cookie("csrfToken", csrfToken, {
  httpOnly: false, // ⚠️ accessible au frontend
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  domain: process.env.NODE_ENV === "production" ? ".cheel-shop.com" : "localhost",
  path: "/"
});