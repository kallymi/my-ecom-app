const express = require("express");
const router = express.Router();
const User = require("../models/userModel");

router.post("/create-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Existe déjà" });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin"
    });

    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
