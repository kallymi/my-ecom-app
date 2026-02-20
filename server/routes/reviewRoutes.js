const express = require('express');
const router = express.Router();
const { createReview, getProductReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Récupérer les avis d'un produit (Public)
router.get('/:productId', getProductReviews);

// Créer un avis (Privé)
router.post('/', protect, createReview);

module.exports = router;