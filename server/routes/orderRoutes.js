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
   RATE LIMITERS
   ===================================================== */
// Limiter les tentatives de suivi public
const trackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  message: 'Trop de tentatives. Réessayez plus tard.'
});

// Optionnel : limiter la création de commandes pour éviter abus/flood
const createLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: 'Trop de commandes créées en peu de temps. Réessayez plus tard.'
});

/* =====================================================
   ROUTES PUBLIQUES / HYBRIDES
   ===================================================== */

// Créer une commande (Invité ou Connecté)
router.post('/', protectOptional, createLimiter, createOrder);

// Suivi public par numéro de commande (Invité)
router.get('/track/:orderNumber', trackLimiter, trackOrder);

/* =====================================================
   ROUTES ADMIN (Strictes)
   ===================================================== */

// Liste toutes les commandes avec filtres et détails
router.get('/admin/all', protect, admin, getAllOrders);

// Statistiques du dashboard
router.get('/admin/stats/count', protect, admin, getOrderCount);

// Mettre à jour le statut d'une commande
router.put('/admin/:id/status', protect, admin, updateOrderStatus);

// router.get('/admin/export', protect, admin, exportOrders);

/* =====================================================
   ROUTES UTILISATEURS CONNECTÉS
   ===================================================== */

// Voir ses propres commandes
router.get('/my-orders', protect, getUserOrders);

// Route pour que le client confirme la réception de son retour/remboursement
router.put('/:id/confirm-return', protect, confirmReturnReceived)
// Voir le détail d'une commande spécifique
// Accessible par l'acheteur ou l'admin
router.get('/:id', protect, getOrderById);
// Route pour demander un retour (Client connecté)
router.put('/:id/request-return', protect, requestOrderReturn);


module.exports = router;
