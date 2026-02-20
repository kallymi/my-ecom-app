require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const Product = require("../models/productModel");

(async () => {
  try {
    console.log("🚀 Démarrage migration Cloudinary");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connecté");

    const uploadDir = path.join(__dirname, "..", "uploads");

    if (!fs.existsSync(uploadDir)) {
      throw new Error("❌ Le dossier uploads n'existe pas");
    }

    const files = fs.readdirSync(uploadDir);
    console.log(`📂 ${files.length} fichiers trouvés dans uploads`);

    const products = await Product.find();

    for (const product of products) {
      let updated = false;

      // Cas 1 : images[] existe
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          if (!image.url || !image.url.startsWith("/uploads")) continue;

          const localPath = path.join(__dirname, "..", image.url);

          if (!fs.existsSync(localPath)) continue;

          const result = await cloudinary.uploader.upload(localPath, {
            folder: "ecommerce/products",
          });

          image.url = result.secure_url;
          image.public_id = result.public_id;
          updated = true;
        }
      }

      // Cas 2 : ancien champ image (string)
      if (product.image && product.image.startsWith("/uploads")) {
        const localPath = path.join(__dirname, "..", product.image);

        if (fs.existsSync(localPath)) {
          const result = await cloudinary.uploader.upload(localPath, {
            folder: "ecommerce/products",
          });

          product.images = [
            {
              url: result.secure_url,
              public_id: result.public_id,
            },
          ];

          product.image = undefined;
          updated = true;
        }
      }

      if (updated) {
        await product.save();
        console.log(`✔ Migré : ${product.name}`);
      }
    }

    console.log("🎉 Migration Cloudinary terminée");
    process.exit(0);

  } catch (error) {
    console.error("❌ Erreur migration :", error);
    process.exit(1);
  }
})();
