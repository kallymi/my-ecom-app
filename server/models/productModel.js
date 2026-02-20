const mongoose = require("mongoose");

/* ==========================================================
   SCHEMA DES IMAGES
   ========================================================== */
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String },
    isMain: { type: Boolean, default: false },
    alt: { type: String },
  },
  { _id: false }
);

/* ==========================================================
   SCHEMA DES PROMOTIONS
   ========================================================== */
const promotionSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, default: false },
    type: { type: String, enum: ["percentage", "fixed"] },
    value: { type: Number, min: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { _id: false }
);

/* ==========================================================
   SCHEMA PRINCIPAL DU PRODUIT
   ========================================================== */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: {
      type: [imageSchema],
      validate: [
        (val) => val.length > 0,
        "Au moins une image est requise",
      ],
    },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    promotion: promotionSchema,
    returnDelay: { type: Number, default: 7 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    // 💡 Crucial : permet aux virtuals d'être envoyés au Frontend (Axios)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ==========================================================
   VIRTUALS (LOGIQUE MÉTIER AUTOMATIQUE)
   ========================================================== */

/**
 * Vérifie si une promotion est valide à l'instant T
 */
productSchema.virtual("isPromoValid").get(function () {
  const now = new Date();
  return (
    this.promotion?.isActive &&
    (!this.promotion.startDate || this.promotion.startDate <= now) &&
    (!this.promotion.endDate || this.promotion.endDate >= now)
  );
});

/**
 * Calcule le prix final (ce que le client paie réellement)
 */
productSchema.virtual("finalPrice").get(function () {
  const originalPrice = this.price;

  if (!this.isPromoValid) return originalPrice;

  let discount = 0;
  if (this.promotion.type === "percentage") {
    discount = (originalPrice * this.promotion.value) / 100;
  } else if (this.promotion.type === "fixed") {
    discount = this.promotion.value;
  }

  // Retourne le prix réduit, mais jamais en dessous de 0
  return Math.max(0, originalPrice - discount);
});

/* ==========================================================
   MÉTHODES (POUR LE PANIER ET LES COMMANDES)
   ========================================================== */

/**
 * Génère un objet de prix "gelé" pour le stockage en base de données
 * Utilisé dans CartController et OrderController
 */
productSchema.methods.getPricingSnapshot = function () {
  const final = this.finalPrice; // Utilise le virtual calculé
  const original = this.price;

  return {
    originalPrice: original,
    unitPrice: final,
    discountAmount: Math.max(0, original - final),
    discountRate: original > 0 ? Math.round(((original - final) / original) * 100) : 0,
    isPromoApplied: this.isPromoValid,
  };
};

/* ==========================================================
   INDEXATION POUR LA RECHERCHE
   ========================================================== */
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);