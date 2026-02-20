const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const mongoose = require("mongoose");
const Product = require("../models/productModel");

async function migrate() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGO_URI non défini dans le .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connecté");

    const products = await Product.find();
    console.log(`${products.length} produits trouvés`);

    for (const product of products) {
      if (!product.promotion) {
        product.promotion = {
          isActive: false,
          type: "percentage",
          value: 0,
          startDate: null,
          endDate: null
        };
        await product.save();
        console.log(`✔ Migré : ${product.name}`);
      }
    }

    console.log("Migration terminée avec succès");
    process.exit(0);
  } catch (error) {
    console.error("Erreur migration :", error.message);
    process.exit(1);
  }
}

migrate();
