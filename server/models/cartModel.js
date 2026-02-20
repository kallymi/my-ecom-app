const mongoose = require('mongoose');

/* ============================
   CART ITEM SCHEMA
============================ */
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  quantity: {
    type: Number,
    min: 1,
    default: 1,
    required: true
  },

  /* 🔒 PRIX GELÉ */
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

  name: String,
  image: String
});



/* ============================
   CART SCHEMA
============================ */
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    items: {
      type: [cartItemSchema],
      default: []
    },

    /* 📊 TOTAUX (CALCULÉS BACKEND UNIQUEMENT) */
    totalItems: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number, // TOTAL À PAYER (APRÈS PROMOS)
      default: 0
    },

    totalDiscount: {
      type: Number, // INFO MARKETING / UX
      default: 0
    }
  },
  { timestamps: true }
);

/* ============================
   MÉTHODE MÉTIER UNIQUE
============================ */
cartSchema.methods.calculateTotals = function () {
  this.totalItems = this.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  this.totalDiscount = this.items.reduce(
    (sum, item) => sum + item.discountPerUnit * item.quantity,
    0
  );

  return this;
};

/* ============================
   EXPORT
============================ */
module.exports =
  mongoose.models.Cart || mongoose.model('Cart', cartSchema);
