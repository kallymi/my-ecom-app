const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getCategoryProductCounts
} = require('../controllers/categoryController');

// Routes pour les catégories
router.route('/')
  .get(getAllCategories)
  .post(createCategory);

router.route('/tree')
  .get(getCategoryTree);

router.route('/product-counts')
  .get(getCategoryProductCounts);

router.route('/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;