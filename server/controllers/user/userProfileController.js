const asyncHandler = require('express-async-handler');
const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');

/* ===============================
   GET /api/users/me
   =============================== */
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  res.json({
    success: true,
    user
  });
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

  user.name = req.body.name ?? user.name;
  user.phone = req.body.phone ?? user.phone;
  user.neighborhood = req.body.neighborhood ?? user.neighborhood;

  if (req.file) {
    user.avatar = `/uploads/${req.file.filename}`;
  }

  await user.save();

  // 🔥 RECHARGE USER COMPLET SANS MOT DE PASSE
  const updatedUser = await User.findById(user._id).select('-password');

  res.json({
    success: true,
    message: 'Profil mis à jour',
    user: updatedUser
  });
});


/* ===============================
   PUT /api/users/me/password
   Sécurité UNIQUEMENT
   =============================== */
const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

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
   PUT /api/users/me/Suprression
   Moi UNIQUEMENT
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
  changeMyPassword,
  deleteMyAccount
};
