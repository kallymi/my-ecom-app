const express = require('express');
const router = express.Router();

// Middlewares
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadCloudinary } = require("../middleware/uploadMiddleware");

// Controllers
const { getAdminStats } = require('../controllers/admin/adminStatsController');
const {
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  deleteUser,
  getActiveUsers,
  toggleBlockUser,
} = require('../controllers/admin/adminUserController');

const {
  getAdminProducts,
  getProductByIdAdmin,
  getAdminTrash,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  permanentDeleteProduct,
  addPromotionToProduct,
  removePromotionFromProduct,
  updatePromotionOnProduct
} = require('../controllers/admin/adminProductController');

const { getRevenueStats } = require("../controllers/admin/adminRevenueController");


const { 
  getOrders,
  updateOrderStatus,
  getReturnOrders,
  approveOrderReturn,
  rejectOrderReturn
} = require("../controllers/admin/adminOrderController");
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/admin/adminCategoryController');

// --- ROUTES ---

// Dashboard
router.get("/stats/revenue", protect, admin, getRevenueStats);
router.get('/stats', protect, admin, getAdminStats);


// --- PRODUITS ---

// 1. Spécifique d'abord
router.get('/products/trash', protect, admin, getAdminTrash);
router.delete('/products/:id/permanent', protect, admin, permanentDeleteProduct);
router.patch('/products/:id/restore', protect, admin, restoreProduct);


// 3. Routes de masse / Création
router.route('/products')
  .get(protect, admin, getAdminProducts)
  .post(protect, admin,  uploadCloudinary.fields([{ name: "mainImage", maxCount: 1 }, { name: "galleryImages", maxCount: 10 }]), createProduct);

// 4. CRUD de base par ID
router.route('/products/:id')
  .get(protect, admin, getProductByIdAdmin)
  .put(protect, admin, uploadCloudinary.fields([{name: "mainImage", maxCount: 1 }, {name: "galleryImages", maxCount: 10 }]), updateProduct)
  .delete(protect, admin, deleteProduct); // Soft delete

// 5. Promotions
router.route('/products/:id/promotion')
  .post(protect, admin, addPromotionToProduct)
  .put(protect, admin, updatePromotionOnProduct)
  .delete(protect, admin, removePromotionFromProduct);


// --- COMMANDES ---
router.get('/orders', protect, admin, getOrders);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);


// --- RETOUR DES COMMANDES
router.put('/orders/:id/approve-return', protect, admin, approveOrderReturn);
router.put('/orders/:id/reject-return', protect, admin, rejectOrderReturn);
router.get('/orders/returns', protect, admin, getReturnOrders);


// --- UTILISATEURS ---
router.get('/users', protect, admin, getUsers);
router.put("/users/:id/role", protect, admin, updateUserRole);
router.get('/stats/active-users', protect, admin, getActiveUsers);
router.patch('/users/:id/block', protect, admin, toggleBlockUser);

router.route('/users/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);


// --- CATÉGORIES ---
router.route('/categories')
  .get(protect, admin, getCategories)
  .post(protect, admin, uploadCloudinary.single("image"), createCategory);

router.route('/categories/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

// --- Code PROMO ---

module.exports = router;