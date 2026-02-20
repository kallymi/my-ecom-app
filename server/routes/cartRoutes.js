const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartCount
} = require('../controllers/cartController');

/* ============================
   ROUTES PANIER (UTILISATEUR)
============================ */

router.get('/', protect, getCart);
router.get('/count', protect, getCartCount);

router.post('/add', protect, addToCart);

router.put('/update/:productId', protect, updateCartItem);

router.delete('/remove/:productId', protect, removeCartItem);

router.delete('/clear', protect, clearCart);

module.exports = router;
