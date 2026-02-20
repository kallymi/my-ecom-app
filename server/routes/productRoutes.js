const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  getFeaturedProducts,
  getNewArrivals
} = require('../controllers/productController');

const streamifier = require("streamifier");




// Routes publiques
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new", getNewArrivals);
router.get("/search", searchProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);

module.exports = router;