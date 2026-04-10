const express = require("express");
const router = express.Router();

router.get("/csrf-token", (req, res) => {
  const csrfToken = require("crypto").randomBytes(32).toString("hex");

  res.cookie("csrfToken", csrfToken, {
    httpOnly: false, // IMPORTANT (accessible JS)
    secure: true,
    sameSite: "none",
  });

  res.json({ csrfToken });
});

module.exports = router;