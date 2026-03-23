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


    let maxDeadline = now;

    // Utilise une boucle map pour garantir la création du tableau
    order.items = order.items.map(item => {
        const delay = item.product?.returnDelay || 2;
        const itemDeadline = new Date(now);
        itemDeadline.setDate(itemDeadline.getDate() + delay);

        // On met a jour la deadline globale de la commande si celle-ci est plus lointaine

        if (itemDeadline > maxDeadline) {
          maxDeadline = itemDeadline;
        }
        
        return {
            ...(item.toObject ? item.toObject() : item), // Garde les données existantes
            returnDeadline: itemDeadline
        };
    });

    // On enregistre La date de validation finale pour le chiffre d'affaire valide 
    order.finalReturnDeadline = maxDeadline;


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
   @desc    REJETER le retour avec motif
   @route   PUT /api/admin/orders/:id/reject-return
====================================================== */
const rejectOrderReturn = asyncHandler(async (req, res) => {
    const { reason } = req.body; // Très utile pour l'expérience client
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
    }

    // Vérification de sécurité
    if (order.status !== 'RETURN_REQUESTED') {
        return res.status(400).json({ message: "Cette commande n'est pas en attente de retour" });
    }

    // Passage au statut spécifique de refus
    order.status = 'RETURN_REJECTED'; 
    
    // Ajout d'un champ pour tracer le motif du refus (à ajouter dans ton modèle Order)
    order.adminNotes = reason || "Aucun motif précisé";
    order.returnRejectedAt = Date.now();
    
    await order.save();
    
    res.json({ 
        success: true, 
        message: "Demande de retour rejetée avec succès",
        order 
    });
});

/* ======================================================
   @desc    Obtenir les données de revenus (Validé vs En attente)
   @route   GET /api/orders/analytics
   @access  Admin
====================================================== */
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { period } = req.query; // "week" ou "month"
  const currentDate = new Date();
  let startDate = new Date();

  // Configuration de la fenêtre de tir
  if (period === 'month') {
    startDate.setDate(currentDate.getDate() - 30);
  } else {
    startDate.setDate(currentDate.getDate() - 7);
  }

  try {
    // Ton contrôleur devient très léger
    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['CANCELLED', 'RETURNED'] }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
          rawDate: { $first: "$createdAt" },
          // Ici, on utilise directement ton flag métier
          caValide: {
            $sum: { $cond: [{ $eq: ["$isRevenueCounted", true] }, "$totalAmount", 0] }
          },
          enAttente: {
            $sum: { $cond: [{ $eq: ["$isRevenueCounted", false] }, "$totalAmount", 0] }
          }
        }
      },
      { $sort: { "rawDate": 1 } }
    ]);

    // Formatage pour le graphique Recharts
    const chartData = stats.map(s => ({
      name: s._id,
      caValide: s.caValide || 0, // Sécurité anti-undefined
      enAttente: s.enAttente || 0
    }));

    const totals = chartData.reduce((acc, curr) => {
      acc.totalValide += curr.caValide;
      acc.totalAttente += curr.enAttente;
      return acc;
    }, { totalValide: 0, totalAttente: 0 });

    res.json({
      success: true,
      chartData,
      totals
    });
    
  } catch (error) {
    // 🔥 Si MongoDB plante, on le saura ici au lieu d'un 500 muet
    console.error("Erreur Analytics Aggregation:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors du calcul des statistiques",
      error: error.message 
    });
  }
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
