const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const mongoose = require("mongoose");
const Order = require("../models/orderModel");

const DB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI;

if (!DB_URI) {
  console.error("❌ URI MongoDB introuvable dans .env");
  process.exit(1);
}

const STATUS_MAP = {
  "En attente": "PENDING",
  "Confirmée": "CONFIRMED",
  "En cours de livraison": "SHIPPING",
  "Livrée": "DELIVERED",
  "Annulée": "CANCELLED",
};

const migrate = async () => {
  try {
    console.log("⏳ Connexion à MongoDB...");
    await mongoose.connect(DB_URI);

    for (const [oldStatus, newStatus] of Object.entries(STATUS_MAP)) {
      const result = await Order.updateMany(
        { status: oldStatus },
        { $set: { status: newStatus } }
      );

      console.log(`✔ ${oldStatus} → ${newStatus} : ${result.modifiedCount}`);
    }

    console.log("✅ Migration terminée");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur migration :", err);
    process.exit(1);
  }
};

migrate();
