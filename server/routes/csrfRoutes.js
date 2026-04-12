const express = require("express");
const router = express.Router();

router.get("/csrf-token", (req, res) => {
  const csrfToken = require("crypto").randomBytes(32).toString("hex");

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("csrfToken", csrfToken, {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    domain: isProd ? ".cheel-shop.com" : "localhost", // ✅ domaine parent
    path: "/",
  });

  // ✅ Header CORS explicite pour cette route
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  res.json({ csrfToken });
});

module.exports = router;