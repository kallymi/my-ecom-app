const asyncHandler = require('express-async-handler');
const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');

/* ======================================================
   @desc    Obtenir toutes les commandes (ADMIN)
   @route   GET /api/admin/orders
   @access  Admin
====================================================== */
const getOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const count = await Order.countDocuments();

  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

/* ======================================================
   @desc    Obtenir une commande par ID (ADMIN)
   @route   GET /api/admin/orders/:id
   @access  Admin
====================================================== */
const getOrderByIdAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name price returnDelay');

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  res.json({
    success: true,
    order
  });
});

/* ======================================================
   @desc    Mettre à jour le statut d'une commande
   @route   PUT /api/admin/orders/:id/status
   @access  Admin
====================================================== */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id)
    .populate('items.product');

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  const oldStatus = order.status;

  /* ===============================
     VALIDATION DU STATUT
  =============================== */
  const allowedStatuses = [
    'PENDING',
    'CONFIRMED',  
    'SHIPPING',    
    'PROCESSING', 
    'DELIVERED',
    'CANCELLED',
    'RETURN_REQUESTED', 
    'RETURNED'
  ];

  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error('Statut invalide');
  }

  /* ===============================
     LOGIQUE DE STOCK
  =============================== */
  const isNowCancelledOrReturned = ['CANCELLED', 'RETURNED'].includes(status);
  const wasActive = !['CANCELLED', 'RETURNED'].includes(oldStatus);

  // 🔴 Annulation ou retour → restock
  if (isNowCancelledOrReturned && wasActive) {
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: item.quantity }
        });
      }
    }
  }

  /* ===============================
     LOGIQUE CHIFFRE D’AFFAIRES
  =============================== */

  // 🟢 Livraison → démarrer délai de retour
  if (status === 'DELIVERED' && oldStatus !== 'DELIVERED') {
    const now = new Date();
    order.deliveredAt = now;
    order.isPaid = true;
    order.paidAt = now;
    order.isRevenueCounted = false;

    // Utilise une boucle map pour garantir la création du tableau
    order.items = order.items.map(item => {
        const delay = item.product?.returnDelay || 2;
        const deadline = new Date(now);
        deadline.setDate(deadline.getDate() + delay);
        
        return {
            ...item.toObject(), // Garde les données existantes
            returnDeadline: deadline
        };
    });

    order.markModified('items'); 
  }

  // 🔁 Retour validé → sortir du CA
  if (status === 'RETURNED' && oldStatus !== 'RETURNED') {
    // On ne restocke que si on vient d'un autre état
    for (const item of order.items) {
        if (item.product) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: item.quantity }
            });
        }
    }
  }

  /* ===============================
     SAUVEGARDE
  =============================== */
  order.status = status;
  const updatedOrder = await order.save();

  /* ===============================
     NOTIFICATION (OPTIONNEL)
  =============================== */
  if (req.io) {
    req.io.emit('admin_order_updated', {
      id: order._id,
      status
    });
  }

  res.json({
    success: true,
    order: updatedOrder
  });
});

/* ======================================================
   @desc    Supprimer une commande (ADMIN)
   @route   DELETE /api/admin/orders/:id
   @access  Admin
====================================================== */
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // ⚠️ Sécurité : éviter suppression commande payée
  if (order.isPaid) {
    res.status(400);
    throw new Error('Impossible de supprimer une commande payée');
  }

  await order.deleteOne();

  res.json({
    success: true,
    message: 'Commande supprimée'
  });
});

/* ======================================================
   @desc    Obtenir uniquement les demandes de retour
   @route   GET /api/admin/orders/returns
====================================================== */
const getReturnOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 
    status: 'RETURN_REQUESTED' // On ne prend QUE les demandes
  })
  .populate('user', 'name email')
  .sort({ returnRequestedAt: -1 });

  res.json({
    success: true,
    orders
  });
});

/* ======================================================
   @desc    APPROUVER le retour
   @route   PUT /api/admin/orders/:id/approve-return
====================================================== */
const approveOrderReturn = asyncHandler(async (req, res) => {
    // IMPORTANT: On peuple les produits pour avoir les IDs
    const order = await Order.findById(req.params.id).populate('items.product');
    
    if (!order) return res.status(404).json({ message: "Commande non trouvée" });

    if (order.status !== 'RETURN_REQUESTED') {
        return res.status(400).json({ message: "Cette commande n'a pas de demande de retour active" });
    }

    // 1. Passer le statut à RETURNED
    order.status = 'RETURNED';
    order.returnedAt = new Date();
    order.isRevenueCounted = false; // Sortir du CA définitivement
    
    // 2. Remettre les produits en stock
    for (const item of order.items) {
        if (item.product) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: item.quantity }
            });
        }
    }

    await order.save();
    res.json({ success: true, message: "Retour approuvé et stock mis à jour" });
});

/* ======================================================
   @desc    REJETER le retour
   @route   PUT /api/admin/orders/:id/reject-return
====================================================== */
const rejectOrderReturn = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Commande non trouvée" });

    // Si on rejette, on remet en DELIVERED (considéré comme vendu)
    order.status = 'DELIVERED'; 
    
    await order.save();
    res.json({ success: true, message: "Demande de retour rejetée" });
});

/* ======================================================
   @desc    Obtenir les données de revenus pour le graphique
   @route   GET /api/admin/orders/analytics
   @access  Admin
====================================================== */
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period } = req.query; // "week" ou "month"
  const now = new Date();
  let startDate = new Date();

  // Configuration de la fenêtre de tir
  if (period === 'month') {
    startDate.setDate(now.getDate() - 30); // 30 derniers jours
  } else {
    startDate.setDate(now.getDate() - 7);  // 7 derniers jours
  }

  const stats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $nin: ['CANCELLED', 'RETURNED'] } // On garde le CA "propre"
      }
    },
    {
      $group: {
        _id: { 
          // On groupe par jour formaté pour le frontend
          $dateToString: { format: "%d/%m", date: "$createdAt" } 
        },
        revenue: { $sum: "$totalPrice" }, // Assure-toi que c'est le bon champ dans ton Model
        rawDate: { $first: "$createdAt" } 
      }
    },
    { $sort: { "rawDate": 1 } } // Tri chronologique indispensable
  ]);

  // Si pas de données, on renvoie un tableau vide pour éviter le crash Recharts
  res.json(stats.map(s => ({ name: s._id, revenue: s.revenue })));
});

/* ======================================================
   EXPORT
====================================================== */
module.exports = {
  getOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  deleteOrder,
  getReturnOrders,
  approveOrderReturn,
  rejectOrderReturn,
  getRevenueAnalytics
};
