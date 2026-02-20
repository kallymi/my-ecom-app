const asyncHandler = require('express-async-handler');
const User = require('../../models/userModel');

// @desc    Obtenir un utilisateur par son ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  res.json({
    success: true,
    user: user // 👈 Très important que ce soit 'user'
  });
});

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  try {
    const pageSize = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    
    const count = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error('Erreur dans getUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/admin/users/:id
// @access  Private/Admin

const updateUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, role, isBlocked } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Sécurité : Un admin ne peut pas se bloquer lui-même ou changer son propre rôle ici
    const isSelf = user._id.toString() === req.user._id.toString();

    // Mise à jour des champs (on ne change le rôle/blocage que si ce n'est pas soi-même)
    user.name = name || user.name;
    user.email = email || user.email;
    
    if (!isSelf) {
      if (role) user.role = role;
      if (typeof isBlocked !== 'undefined') user.isBlocked = isBlocked;
    }

    // Utilisation de findByIdAndUpdate pour bypasser les validateurs de champs non envoyés (comme password)
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        isBlocked: user.isBlocked 
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur de mise à jour',
      error: error.message
    });
  }
});


// @desc    Modifier le rôle d’un utilisateur
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!['customer', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Rôle invalide');
  }

  if (req.user._id.toString() === id) {
    res.status(403);
    throw new Error("Vous ne pouvez pas modifier votre propre rôle");
  }

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé');
  }

  user.role = role;

  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: 'Rôle mis à jour',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

const getActiveUsers = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // On compte les utilisateurs dont lastActive est plus récent que 5 min
    const activeCount = await User.countDocuments({
      lastActive: { $gt: fiveMinutesAgo }
    });

    res.json({ activeUsers: activeCount });
  } catch (error) {
    res.status(500).json({ message: "Erreur comptage actifs" });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Sécurité : Empêcher la suppression de soi-même
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    // Suppression définitive
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// @desc    Bloquer/Débloquer un utilisateur
// @route   PATCH /api/admin/users/:id/block
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    user.isBlocked = !user.isBlocked;
    await user.save(); // Ici save() fonctionne car on a déjà le document

    res.json({ success: true, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    updateUserRole,
    deleteUser,
    getActiveUsers,
    toggleBlockUser,
}
