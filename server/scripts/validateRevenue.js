const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const mongoose = require("mongoose");
const Order = require("../models/orderModel");

/* ============================
   CONFIG DB
============================ */
const DB_URI = process.env.MONGODB_URI;

if (!DB_URI) {
  console.error("❌ URI MongoDB introuvable dans .env");
  process.exit(1);
}

/* ============================
   SCRIPT
============================ */
const validateRevenue = async () => {
  try {
    console.log("⏳ Connexion à MongoDB...");
    await mongoose.connect(DB_URI);

    const now = new Date();

    console.log("🔍 Recherche des commandes éligibles au CA...");

    /**
     * CONDITIONS :
     * - Livrée
     * - Pas retournée
     * - CA non encore comptabilisé
     * - Tous les délais de retour expirés
     */
    const orders = await Order.find({
      status: "DELIVERED",
      isRevenueCounted: false,
      returnedAt: null,
      "items.returnDeadline": { $lt: now }
    });

    if (!orders.length) {
      console.log("ℹ️ Aucune commande éligible pour validation du CA");
      process.exit(0);
    }

    let totalValidated = 0;

    for (const order of orders) {
      // 🔐 Sécurité supplémentaire : TOUS les items doivent être expirés
      const allExpired = order.items.every(
        item => item.returnDeadline && item.returnDeadline < now
      );

      if (!allExpired) continue;

      order.isRevenueCounted = true;
      await order.save();

      totalValidated += order.totalPrice;

      console.log(
        `✔ CA validé | ${order.orderNumber} | ${order.totalPrice.toLocaleString()}`
      );
    }

    console.log("=================================");
    console.log(`✅ CA total validé : ${totalValidated.toLocaleString()}`);
    console.log("✅ Validation terminée avec succès");

    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur validation CA :", err);
    process.exit(1);
  }
};

validateRevenue();
