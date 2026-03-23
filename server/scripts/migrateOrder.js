const path = require("path");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const Order = require("../models/orderModel");

/* =========================
   CONFIG DB
========================= */
const DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!DB_URI) {
  console.error("❌ URI MongoDB introuvable dans le fichier .env");
  process.exit(1);
}

/* =========================
   MIGRATION ORDERS
========================= */
const migrateOrdersDeadline = async () => {
  try {
    console.log("⏳ Connexion à MongoDB...");
    await mongoose.connect(DB_URI);

    console.log("🔄 Début de la migration des finalReturnDeadline...");

    // 1. On récupère toutes les commandes livrées sans deadline racine
    const orders = await Order.find({ 
      status: "DELIVERED", 
      finalReturnDeadline: { $exists: false } 
    });

    console.log(`🔎 Commandes à traiter : ${orders.length}`);

    let updatedCount = 0;

    // 2. On boucle pour calculer et mettre à jour
    for (const order of orders) {
      if (order.items && order.items.length > 0) {
        // Trouver la date la plus éloignée dans le tableau items
        const maxDate = new Date(Math.max(...order.items.map(i => new Date(i.returnDeadline))));

        // Mettre à jour la commande
        await Order.updateOne(
          { _id: order._id },
          { $set: { finalReturnDeadline: maxDate } }
        );
        updatedCount++;
      }
    }

    console.log(`✔ Commandes mises à jour : ${updatedCount}`);
    console.log("✅ Migration terminée avec succès");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur migration :", error);
    process.exit(1);
  }
};

migrateOrdersDeadline();