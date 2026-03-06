const crypto = require('crypto');
const asyncHandler = require('express-async-handler');

const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const { request } = require('http');

/* =====================================================
   UTILITAIRE
===================================================== */
const generateOrderNumber = () =>
  `CMD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

/* =====================================================
   CREATE ORDER (USER / GUEST)
===================================================== */
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, items } = req.body;
  const isGuest = !req.user;

  let orderItems = [];
  let totalAmount = 0;

  /* =================================================
      LOGIQUE USER CONNECTÉ
  ================================================= */
  if (!isGuest) {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error('Votre panier est vide');
    }

    // Vérification stock & Construction items (On utilise les prix déjà gelés du panier)
    orderItems = cart.items.map(item => {
      if (item.product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Stock insuffisant pour ${item.product.name} (Disponible: ${product.stock} )`);
      }
      return {
        product: item.product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        originalPrice: item.originalPrice,
        discountPerUnit: item.discountPerUnit,
        name: item.name,
        image: item.image,
        returnDeadline: new Date(Date.now() + (item.product.returnDelay || 7) * 24 * 60 * 60 * 1000)
      };
    });

    totalAmount = cart.totalAmount;
  } 
  /* =================================================
      LOGIQUE INVITÉ (GUEST) - SÉCURISÉE
  ================================================= */
  else {
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('Panier invité vide');
    }

    for (const item of items) {
      const product = await Product.findById(item.product); // Utilise .product (id envoyé par le front)

      if (!product || !product.isActive) {
        throw new Error(`Le produit ${item.name || 'choisi'} n'est plus disponible`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour ${product.name}`);
      }

      // 🛡️ SÉCURITÉ : On utilise le snapshot du modèle Product
      const pricing = product.getPricingSnapshot();

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: pricing.unitPrice,
        originalPrice: pricing.originalPrice,
        discountPerUnit: pricing.discountAmount,
        name: product.name,
        image: product.images.find(img => img.isMain)?.url || product.images[0]?.url,
        returnDeadline: new Date(Date.now() + (product.returnDelay || 7) * 24 * 60 * 60 * 1000)
      });

      totalAmount += pricing.unitPrice * item.quantity;
    }
  }

  /* =================================================
      VALIDATION & PERSISTANCE (Inchangé mais propre)
  ================================================= */
  const order = await Order.create({
    user: isGuest ? null : req.user._id,
    isGuest,
    orderNumber: generateOrderNumber(),
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    totalAmount,
    status: 'PENDING'
  });

  // Décrémentation du stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity }
    });
  }

  // Vidage du panier si user connecté
  if (!isGuest) {
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [], totalAmount: 0, totalItems: 0 } });
  }

  const populatedOrder = await Order.findById(order._id).populate('items.product', 'name images');

  res.status(201).json({
    success: true, 
    order: populatedOrder
  });
});

/* =====================================================
   COMMANDES UTILISATEUR
===================================================== */
const getUserOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Page actuelle (défaut 1)
  const limit = 15; // Nombre de commandes par page
  const skip = (page - 1) * limit;

  const totalOrders = await Order.countDocuments({ user: req.user._id, isGuest: false });

  const orders = await Order.find({ user: req.user._id, isGuest: false })
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    orders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
    totalOrders
  });
});

/* =====================================================
   COMMANDE PAR ID
===================================================== */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images');

  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  // Sécurité accès
  if (!order.isGuest && order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Accès refusé');
  }

  res.json({ success: true, order });
});

/* =====================================================
   ADMIN – TOUTES LES COMMANDES
===================================================== */
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});

/* =====================================================
   ADMIN – UPDATE STATUS
===================================================== */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id)
    .populate('items.product');

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Annulation => retour stock
  const isStockRestoringStatus = ['CANCELLED', 'RETURNED'].includes(status);
  const wasAlreadyRestored = ['CANCELLED', 'RETURNED'].includes(order.status);

  if (isStockRestoringStatus && !wasAlreadyRestored) {
      for (const item of order.items) {
          if (item.product) {
              await Product.findByIdAndUpdate(item.product._id, {
                  $inc: { stock: item.quantity }
              });
          }
      }
  }

  if (status === 'DELIVERED') {
    order.deliveredAt = Date.now();

    // On calcul la date limite de retour pour chaque aticle
    order.items.forEach((item) => {
      // On récupère le délai du produit (depuis le populate) ou 7 par défaut
      const delay = item.product?.returnDelay || 7;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + delay);
      
      item.returnDeadline = deadline;
    });
  }

  order.status = status;
  await order.save();

  res.json({
    success: true,
    message: `Statut mis à jour : ${status}`,
    order
  });
});



/* =====================================================
   CONFIM RETURN RECEIVED 
===================================================== */
const confirmReturnReceived = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // SÉCURITÉ : Vérifier que c'est bien le client de la commande
  if (!order.isGuest) {
     if (!req.user || order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Non autorisé à modifier cette commande');
     }
  } else {
     // Optionnel : Pour un guest, vérifier un token ou le numéro de téléphone en query
     const phone = req.query.phone;
     if (order.shippingAddress.phone !== phone) {
        res.status(403);
        throw new Error('Vérification du numéro de téléphone échouée');
     }
  }

  if (order.status !== 'RETURNED') {
    res.status(400);
    throw new Error('Le retour doit être validé par l admin avant confirmation');
  }

  order.status = 'RETURNED_COMPLETED'; 
  await order.save();

  res.json({ success: true, message: "Retour confirmé et clos" });
});

/* =====================================================
   REQUEST ORDER RETURN
===================================================== */
const requestOrderReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable');
  }

  // Sécurité : Seul le propriétaire peut demander le retour
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Action non autorisée');
  }

  // Vérification du statut
  if (order.status !== 'DELIVERED') {
    res.status(400);
    throw new Error('Seule une commande livrée peut être retournée');
  }

  // VÉRIFICATION DE LA DATE LIMITE
  // On compare chaque item car ils peuvent avoir des délais différents
  // Ou on vérifie globalement si ton modèle a une date limite globale
  const now = new Date();
  
  // Si tu as une date limite par produit (comme dans ton code précédent) :
  const canReturn = order.items.some(item => new Date(item.returnDeadline) > now);

  if (!canReturn) {
    res.status(400);
    throw new Error('Le délai de retour de 7 jours est expiré pour tous les articles');
  }

  order.status = 'RETURN_REQUESTED'; // Nouveau statut à ajouter à ton Enum
  order.returnRequestedAt = now;
  
  await order.save();

  res.json({ 
    success: true, 
    message: "Votre demande de retour a été transmise à l'administrateur" 
  });
});


/* =====================================================
   STATS (ADMIN)
===================================================== */
const getOrderCount = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: 'PENDING' });
  const deliveredOrders = await Order.countDocuments({ status: 'DELIVERED' });
  const pendingReturns = await Order.countDocuments({ status: 'RETURN_REQUESTED' });

  const revenue = await Order.aggregate([
    { $match: { status: 'DELIVERED' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      pendingReturns,
      totalRevenue: revenue[0]?.total || 0
    }
  });
});

/* =====================================================
   TRACK ORDER (PUBLIC) - VERSION CORRIGÉE
===================================================== */
const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  const { phone } = req.query;

  if (!phone) {
    res.status(400);
    throw new Error('Numéro de téléphone requis pour le suivi');
  }

  // Nettoyage du téléphone pour la recherche (on garde les derniers chiffres)
  const cleanPhone = phone.replace(/\D/g, '');

  // 1. On cherche la commande
  // 2. On populate le produit pour avoir les images actuelles
  const order = await Order.findOne({
    orderNumber: orderNumber.trim().toUpperCase(),
    'shippingAddress.phone': { $regex: cleanPhone }
  }).populate('items.product', 'name images'); // Ajout de 'images' ici

  if (!order) {
    res.status(404);
    throw new Error('Commande introuvable ou accès refusé');
  }

  // On renvoie un objet complet mais sécurisé
  res.json({
    success: true,
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      shippingAddress: {
        neighborhood: order.shippingAddress.neighborhood,
        addressDetails: order.shippingAddress.addressDetails,
        phone: order.shippingAddress.phone
      },
      // Ici on enrichit les items avec les images et les prix
      items: order.items.map(i => ({
        name: i.product?.name || i.name, // Nom du produit peuplé ou snapshot
        quantity: i.quantity,
        price: i.unitPrice || i.price, // Supporte tes deux formats de prix
        // On récupère l'image soit du produit peuplé, soit du snapshot de la commande
        image: i.product?.images?.[0]?.url || i.image,
        product: i.product // Optionnel: utile pour les liens vers le produit
      }))
    }
  });
});

/* =====================================================
   EXPORT
===================================================== */
module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  confirmReturnReceived,
  requestOrderReturn,
  getOrderCount,
  trackOrder
};
