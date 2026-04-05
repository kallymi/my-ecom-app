const mongoose = require('mongoose');

/* ============================
   ORDER ITEM SCHEMA
============================ */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    quantity: {
      type: Number,
      min: 1,
      required: true
    },

    /* 🔒 PRIX GELÉS */
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },

    originalPrice: {
      type: Number,
      required: true,
      min: 0
    },

    discountPerUnit: {
      type: Number,
      default: 0,
      min: 0
    },

    /* 📸 SNAPSHOT */
    name: String,
    image: String,

    /* 🔁 RETOUR */
    returnDeadline: Date
  },
  { _id: false }
);

/* ============================
   ORDER SCHEMA
============================ */
const orderSchema = new mongoose.Schema(
  {
    /* ---------- CLIENT ---------- */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return !this.isGuest;
      }
    },

    isGuest: {
      type: Boolean,
      default: false,
      index: true
    },

    guestInfo: {
      fullName: String,
      phone: String,
      email: String
    },

    /* ---------- ARTICLES ---------- */
    items: {
      type: [orderItemSchema],
      validate: [
        (val) => val.length > 0,
        'La commande doit contenir au moins un article'
      ]
    },

    /* ---------- LIVRAISON ---------- */
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      neighborhood: { type: String, required: true },
      addressDetails: String
    },

    /* ---------- PAIEMENT ---------- */
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    paymentMethod: {
      type: String,
      enum: ['COD', 'MOBILE_MONEY', 'CARD'],
      default: 'COD'
    },

    isPaid: {
      type: Boolean,
      default: false,
      index: true
    },

    paidAt: Date,

    /* ---------- STATUT ---------- */
    status: {
      type: String,
      enum: [
        'PENDING',
        'CONFIRMED',
        'SHIPPING',
        'DELIVERED',
        'RETURN_REQUESTED',
        'RETURNED',
        'RETURN_REJECTED',
        'CANCELLED',
        'RETURNED_COMPLETED'
      ],
      default: 'PENDING',
      index: true
    },

    /* ---------- DATES ---------- */
    deliveredAt: Date,
    returnedAt: Date,
    finalReturnDeadline: { type: Date, index: true },

    /* ---------- BUSINESS ---------- */
    isRevenueCounted: {
      type: Boolean,
      default: false,
      index: true
    },

    /* ---------- IDENTIFIANT ---------- */
    orderNumber: {
      type: String,
      unique: true,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* ============================
   VIRTUALS MÉTIER
============================ */

// 🔁 Commande retournable ?
orderSchema.virtual('isReturnable').get(function () {
  if (this.status !== 'DELIVERED') return false;

  const now = new Date();
  return this.items.some(
    item => item.returnDeadline && item.returnDeadline >= now
  );
});

// 💰 Éligible au CA ?
// 💰 Éligible au CA ?
orderSchema.virtual('isEligibleForRevenue').get(function () {
  if (this.status !== 'DELIVERED') return false;
  if (this.isRevenueCounted) return true; // Si déjà forcé par l'admin

  if (!this.finalReturnDeadline) return false;

  const now = new Date();
  return this.finalReturnDeadline < now;
});
/* ============================
   EXPORT
============================ */
module.exports =
  mongoose.models.Order || mongoose.model('Order', orderSchema);


  