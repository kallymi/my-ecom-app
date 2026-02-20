const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');

/* ============================
   UTIL
============================ */
const populateCart = (cartId) =>
  Cart.findById(cartId).populate(
    'items.product',
    'name images stock isActive'
  );

/* ============================
   GET CART
============================ */
exports.getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.json({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      totalDiscount: 0
    });
  }

  const populatedCart = await populateCart(cart._id);
  res.json(populatedCart);
});

/* ============================
   ADD TO CART (SOURCE DE VÉRITÉ)
============================ */
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user._id;

  if (quantity <= 0) {
    return res.status(400).json({ message: 'Quantité invalide' });
  }

  // 1. Recherche du produit avec les critères de disponibilité
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
    isDeleted: false
  });

  if (!product) {
    return res.status(404).json({ message: 'Produit indisponible' });
  }

  // 2. Vérification globale du stock
  if (product.stock < quantity) {
    return res.status(400).json({
      message: `Stock insuffisant (disponible: ${product.stock})`
    });
  }

  // 3. 🛡️ SÉCURITÉ : Utilisation du Snapshot du modèle
  // On récupère les prix calculés par le serveur (isPromoValid, finalPrice, etc.)
  const pricing = product.getPricingSnapshot();

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    // Vérification si l'ajout dépasse le stock total
    if (existingItem.quantity + quantity > product.stock) {
      return res.status(400).json({
        message: `Impossible d'ajouter plus d'articles (Stock max: ${product.stock})`
      });
    }
    existingItem.quantity += quantity;
    
    // 💡 Optionnel : on met à jour le prix au cas où la promo a changé
    existingItem.unitPrice = pricing.unitPrice;
  } else {
    // 4. Ajout de la nouvelle ligne avec les données "gelées"
    cart.items.push({
      product: product._id,
      quantity,
      unitPrice: pricing.unitPrice,        // Prix après promo
      originalPrice: pricing.originalPrice, // Prix de base
      discountPerUnit: pricing.discountAmount,
      name: product.name,
      // On prend l'image principale ou la première disponible
      image: product.images.find(img => img.isMain)?.url || product.images[0]?.url
    });
  }

  // 5. Recalcul des totaux (totalAmount, totalItems) via la méthode du schéma Cart
  cart.calculateTotals();
  
  await cart.save();

  // 6. Retourne le panier peuplé pour le Frontend
  const populatedCart = await Cart.findById(cart._id).populate({
    path: 'items.product',
    select: 'name price images promotion stock finalPrice isPromoValid' // On inclut les virtuals
  });

  res.status(200).json({
    success: true,
    data: populatedCart
  });
});

/* ============================
   UPDATE QUANTITY
============================ */
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 0) {
    return res.status(400).json({ message: 'Quantité invalide' });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Panier introuvable' });

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );
  if (!item) return res.status(404).json({ message: 'Article absent du panier' });

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(400).json({ message: 'Produit indisponible' });
  }

  if (quantity === 0) {
    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );
  } else {
    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Stock insuffisant (disponible: ${product.stock})`
      });
    }
    item.quantity = quantity;
  }

  cart.calculateTotals();
  await cart.save();

  const populatedCart = await populateCart(cart._id);
  res.json(populatedCart);
});

/* ============================
   REMOVE ITEM
============================ */
exports.removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Panier introuvable' });

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  cart.calculateTotals();
  await cart.save();

  const populatedCart = await populateCart(cart._id);
  res.json(populatedCart);
});

/* ============================
   CLEAR CART
============================ */
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.calculateTotals();
    await cart.save();
  }

  res.json({
    items: [],
    totalItems: 0,
    totalAmount: 0,
    totalDiscount: 0
  });
});

/* ============================
   CART COUNT
============================ */
exports.getCartCount = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  res.json({ count: cart?.totalItems || 0 });
});

/* ============================
   DELETE CART ITEM
============================ */
exports.deleteCartItem = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({ message: 'Panier introuvable' });
  }

  const itemId = req.params.id;

  cart.items = cart.items.filter(
    item => item._id.toString() !== itemId
  );

  cart.calculateTotals();
  await cart.save();

  res.json({ success: true, cart });
};

