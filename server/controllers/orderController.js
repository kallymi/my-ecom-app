const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

/* =====================================================
    UTILITAIRES
===================================================== */
const generateOrderNumber = () =>
    `CMD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

/* =====================================================
    CREATE ORDER (USER / GUEST)
===================================================== */
const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod, items: frontendItems } = req.body;
    const isGuest = !req.user;

    let orderItems = [];
    let totalAmount = 0;

    // Fonction utilitaire pour traiter chaque item et garantir le calcul du prix
    const processItems = async (itemsList) => {
        const processed = [];
        let runningTotal = 0;

        for (const item of itemsList) {
            // On fetch le produit en base pour être sûr d'avoir le prix à jour
            const product = await Product.findById(item.product._id || item.product);
            if (!product || !product.isActive) throw new Error(`Produit indisponible`);
            
            // Calcul du prix via ta logique métier (Snapshot)
            const pricing = product.getPricingSnapshot();
            
            processed.push({
                product: product._id,
                quantity: item.quantity,
                unitPrice: pricing.unitPrice,
                originalPrice: pricing.originalPrice,
                discountPerUnit: pricing.discountAmount,
                name: product.name,
                image: product.images.find(img => img.isMain)?.url || product.images[0]?.url,
                returnDeadline: new Date(Date.now() + (product.returnDelay || 7) * 24 * 60 * 60 * 1000)
            });
            runningTotal += pricing.unitPrice * item.quantity;
        }
        return { processed, runningTotal };
    };

    // 1. DÉTERMINATION DES ITEMS
    if (!isGuest) {
        const cart = await Cart.findOne({ user: req.user._id });
        const itemsToProcess = (cart && cart.items.length > 0) ? cart.items : frontendItems;

        if (!itemsToProcess || itemsToProcess.length === 0) {
            res.status(400);
            throw new Error('Votre panier est vide');
        }

        const { processed, runningTotal } = await processItems(itemsToProcess);
        orderItems = processed;
        totalAmount = runningTotal;
    } else {
        if (!frontendItems || frontendItems.length === 0) {
            res.status(400);
            throw new Error('Panier invité vide');
        }
        const { processed, runningTotal } = await processItems(frontendItems);
        orderItems = processed;
        totalAmount = runningTotal;
    }

    // 2. CRÉATION DE LA COMMANDE
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

    // 3. MISE À JOUR STOCK
    await Promise.all(orderItems.map(item => 
        Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
    ));

    // 4. NETTOYAGE PANIER
    if (!isGuest) {
        await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [], totalAmount: 0, totalItems: 0 } });
    }

    res.status(201).json({ success: true, order });
});

/* =====================================================
    GET USER ORDERS (Protégé)
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
    GET ORDER BY ID (Accès Restreint)
===================================================== */
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images price');

    if (!order) {
        res.status(404);
        throw new Error('Commande introuvable');
    }

    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && order.user && order.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner && !order.isGuest) {
        res.status(403);
        throw new Error('Accès non autorisé');
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
    UPDATE STATUS (Version augmentée avec Gestion Refus)
===================================================== */
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // status peut être 'RETURNED', 'RETURN_REJECTED', etc.
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Commande introuvable');
    }

    // 1. Déterminer si on doit restaurer le stock
    // On ne restaure le stock QUE si le retour est validé (RETURNED) ou annulé (CANCELLED)
    const wasStockRestored = ['CANCELLED', 'RETURNED', 'RETURNED_COMPLETED'].includes(order.status);
    const willRestoreStock = ['CANCELLED', 'RETURNED'].includes(status);

    // Si on passe à RETURN_REJECTED, willRestoreStock sera 'false', donc le stock reste inchangé.
    if (willRestoreStock && !wasStockRestored) {
        await Promise.all(order.items.map(item => 
            Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
        ));
    }

    // 2. Mise à jour des dates clés selon le statut
    order.status = status;
    
    if (status === 'DELIVERED') {
        order.deliveredAt = Date.now();
    }
    
    // Optionnel : Enregistrer la date du refus ou de l'acceptation
    if (status === 'RETURNED') {
        order.returnAcceptedAt = Date.now();
    } else if (status === 'RETURN_REJECTED') {
        order.returnRejectedAt = Date.now();
        // Tu pourrais aussi ajouter order.adminNotes = req.body.reason si tu veux expliquer pourquoi
    }
    
    await order.save();
    res.json({ 
        success: true, 
        message: `Statut mis à jour avec succès : ${status}`, 
        order 
    });
});

/* =====================================================
    REQUEST ORDER RETURN
===================================================== */
const requestOrderReturn = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order || order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Action non autorisée');
    }

    if (order.status !== 'DELIVERED') {
        res.status(400);
        throw new Error('La commande doit être livrée pour demander un retour');
    }

    const canReturn = order.items.some(item => new Date(item.returnDeadline) > new Date());
    if (!canReturn) {
        res.status(400);
        throw new Error('Le délai de retour est expiré');
    }

    order.status = 'RETURN_REQUESTED';
    order.returnRequestedAt = Date.now();
    await order.save();

    res.json({ success: true, message: "Demande de retour envoyée" });
});

/* =====================================================
    CONFIRM RETURN RECEIVED 
===================================================== */
const confirmReturnReceived = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Commande non trouvée');
    }

    // Vérification de sécurité
    if (!order.isGuest) {
        if (!req.user || order.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Non autorisé');
        }
    }

    if (order.status !== 'RETURNED') {
        res.status(400);
        throw new Error('Le retour doit être validé par l\'admin avant confirmation');
    }

    order.status = 'RETURNED_COMPLETED'; 
    await order.save();

    res.json({ success: true, message: "Retour confirmé et clos" });
});


/* =====================================================
    TRACK ORDER (PUBLIC)
===================================================== */
const trackOrder = asyncHandler(async (req, res) => {
    const { orderNumber } = req.params;
    const { phone } = req.query;

    if (!phone) {
        res.status(400);
        throw new Error('Téléphone requis');
    }

    const order = await Order.findOne({
        orderNumber: orderNumber.trim().toUpperCase(),
        'shippingAddress.phone': { $regex: phone.replace(/\D/g, '') }
    }).populate('items.product', 'name images');

    if (!order) {
        res.status(404);
        throw new Error('Commande introuvable');
    }

    res.json({ success: true, order });
});

/* =====================================================
    STATS (ADMIN)
===================================================== */
const getOrderCount = asyncHandler(async (req, res) => {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'PENDING' });
    const pendingReturns = await Order.countDocuments({ status: 'RETURN_REQUESTED' });

    const revenue = await Order.aggregate([
        { $match: { status: 'DELIVERED' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
        success: true,
        data: { totalOrders, pendingOrders, pendingReturns, totalRevenue: revenue[0]?.total || 0 }
    });
});

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    requestOrderReturn,
    confirmReturnReceived,
    getOrderCount,
    trackOrder
};