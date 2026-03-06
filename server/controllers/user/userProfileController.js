const asyncHandler = require('express-async-handler');
const User = require('../../models/userModel'); // Vérifie bien ce chemin
const bcrypt = require('bcryptjs');

/* ===============================
   GET /api/users/me
   =============================== */
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
});

/* ===============================
   PUT /api/users/me
   Infos personnelles UNIQUEMENT
   =============================== */
const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  // 1. Gestion spécifique de l'e-mail (Vérification d'unicité)
  if (req.body.email) {
    const newEmail = req.body.email.toLowerCase().trim();
    
    // Si l'e-mail change, on vérifie s'il n'est pas déjà pris
    if (newEmail !== user.email) {
      const emailExists = await User.findOne({ 
        email: newEmail,
        _id: { $ne: user._id }
      });
      if (emailExists) {
        res.status(400);
        throw new Error('Cet e-mail est déjà utilisé par un autre compte');
      }
      user.email = newEmail;
    }
  }

  // 2. Mise à jour des autres champs
  // On utilise le "Nullish coalescing" (??) pour accepter les chaînes vides 
  // mais garder l'ancienne valeur si le champ n'est pas dans req.body
  user.name = req.body.name ?? user.name;
  user.phone = req.body.phone ?? user.phone;
  user.neighborhood = req.body.neighborhood ?? user.neighborhood;

  // 3. Gestion de l'avatar (si tu utilises multer)
  if (req.file) {
    user.avatar = `/uploads/avatars/${req.file.filename}`;
  }

  // 4. Sauvegarde
  // On utilise validateBeforeSave: false si on veut être moins strict, 
  // mais ici on va laisser la validation par défaut pour la sécurité.
  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'Profil mis à jour avec succès',
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email, // Déjà en minuscules grâce au schéma + contrôleur
      phone: updatedUser.phone,
      neighborhood: updatedUser.neighborhood,
      avatar: updatedUser.avatar,
      role: updatedUser.role
    }
  });
});
/* ===============================
   PUT /api/users/me/password
   Sécurité UNIQUEMENT
   =============================== */
const updateMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Tous les champs sont requis');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Mot de passe actuel incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Mot de passe modifié avec succès'
  });
});

/* ===============================
   DELETE /api/users/me
   Suppression de son propre compte
   =============================== */
const deleteMyAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur introuvable');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Mot de passe incorrect');
  }

  user.isDeleted = true;
  await user.save();

  res.json({
    success: true,
    message: 'Compte supprimé avec succès'
  });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateMyPassword, 
  deleteMyAccount
};