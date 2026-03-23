const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const {
    createOrder,
    getAllOrders,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    confirmReturnReceived,
    requestOrderReturn,
    getOrderCount,
    trackOrder
} = require('../controllers/orderController');

const { protectOptional, protect, admin } = require('../middleware/authMiddleware');

/* =====================================================
   1. LIMITERS (Sécurité anti-flood)
   ===================================================== */
const trackLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: { message: 'Trop de tentatives. Réessayez plus tard.' }
});

const createLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { message: 'Trop de commandes créées en peu de temps.' }
});

/* =====================================================
   2. ROUTES PUBLIQUES / HYBRIDES
   ===================================================== */

// Créer une commande (Middleware protectOptional pour lier l'user s'il est là)
router.post('/', protectOptional, createLimiter, createOrder);

// Suivi public (GUEST) - Utilise le numéro de commande et le téléphone en query
router.get('/track/:orderNumber', trackLimiter, trackOrder);

/* =====================================================
   3. ROUTES ADMIN (Stricte priorité)
   ===================================================== */

// Toutes les routes admin doivent être regroupées et placées AVANT les routes /:id
router.get('/admin/all', protect, admin, getAllOrders);
router.get('/admin/stats/count', protect, admin, getOrderCount);
router.put('/admin/:id/status', protect, admin, updateOrderStatus);

/* =====================================================
   4. ROUTES UTILISATEURS CONNECTÉS
   ===================================================== */

// IMPORTANT : /my-orders DOIT être avant /:id
router.get('/my-orders', protect, getUserOrders);

// Actions spécifiques à une commande
// On les place ici pour éviter les conflits
router.put('/:id/confirm-return', protect, confirmReturnReceived);
router.put('/:id/request-return', protect, requestOrderReturn);

// DETAIL D'UNE COMMANDE (En dernier car le :id est un "catch-all")
router.get('/:id', protect, getOrderById);

module.exports = router;