const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const User = require("../models/userModel");

/* =========================
   CONFIG DB
========================= */
const DB_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

if (!DB_URI) {
  console.error("❌ URI MongoDB introuvable dans le fichier .env");
  process.exit(1);
}

/* =========================
   MIGRATION
========================= */
const migrateCustomerToUser = async () => {
  try {
    console.log("⏳ Connexion à MongoDB...");
    await mongoose.connect(DB_URI);

    console.log("🔄 Migration des rôles customer → user...");

    const result = await User.updateMany(
      { role: "customer" },
      { $set: { role: "user" } }
    );

    console.log(`✔ Utilisateurs mis à jour : ${result.modifiedCount}`);

    console.log("✅ Migration terminée avec succès");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur migration :", error);
    process.exit(1);
  }
};

migrateCustomerToUser();
