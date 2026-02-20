const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const mongoose = require("mongoose");
const Product = require("../models/productModel"); // adapte le chemin si nécessaire

async function migrateProducts() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI non défini dans le .env");
    }

    // Connexion simplifiée pour Mongoose v7+
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connecté");

    const products = await Product.find();
    console.log(`${products.length} produits trouvés`);

    for (const product of products) {
      // 1️⃣ Réactiver le produit
      product.isDeleted = false;

      // 2️⃣ Remplir le tableau images si vide
      if ((!product.images || product.images.length === 0) && product.image) {
        product.images = [product.image];
      }

      // 3️⃣ Ajouter ou initialiser le champ promotion
      if (!product.promotion) {
        product.promotion = {
          isActive: false,    // true si tu veux activer la promotion de test
          type: "percentage", // ou "fixed" pour prix fixe
          value: 0,           // ex: 10 pour 10%
          startDate: null,
          endDate: null
        };
      }

      await product.save();
      console.log(`✔ Produit mis à jour : ${product.name}`);
    }

    console.log("Migration terminée avec succès !");
    mongoose.connection.close();
  } catch (error) {
    console.error("Erreur migration :", error.message);
    process.exit(1);
  }
}

migrateProducts();
