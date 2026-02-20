const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/userModel");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "cheel.infos@gmail.com";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("⚠️ Admin existe déjà.");
      process.exit();
    }

    const admin = await User.create({
      name: "Super Admin",
      email: email,
      password: "123456",
      role: "admin",
      isVerified: true
    });

    console.log("✅ Admin créé avec succès !");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);

    process.exit();

  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
};

createAdmin();
