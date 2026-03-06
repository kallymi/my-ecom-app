const express = require('express');
const router = express.Router();

// 1. Import du middleware de protection (JWT)
const { protect } = require('../middleware/authMiddleware');

// 2. Import des fonctions depuis userProfileController.js
// On n'importe PAS userController.js ici car il est réservé à l'admin
const {
  getMyProfile,
  updateMyProfile,
  updateMyPassword, // Assure-toi que le nom correspond à l'export dans ton contrôleur
  deleteMyAccount
} = require('../controllers/user/userProfileController');

// 3. Application du middleware de protection à TOUTES les routes qui suivent
router.use(protect);

/* ==========================================================
   ROUTES POUR L'UTILISATEUR CONNECTÉ (Moi-même)
   URL de base : /api/users
   ========================================================== */

// GET /api/users/me -> Récupérer mes infos
router.get('/me', getMyProfile);

// PUT /api/users/me -> Modifier mon nom, tel, quartier, email
router.put('/me', updateMyProfile);

// PUT /api/users/me/password -> Modifier mon mot de passe
router.put('/me/password', updateMyPassword);

// DELETE /api/users/me -> Supprimer mon propre compte (soft delete ou définitif)
router.delete('/me', deleteMyAccount);

module.exports = router;