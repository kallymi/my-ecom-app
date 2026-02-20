const User = require('../models/userModel');
const Order = require('../models/orderModel');
const bcrypt = require('bcryptjs');

// Obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Obtenir un utilisateur par son ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        // Obtenir les commandes de l'utilisateur
        const orders = await Order.find({ user: req.params.id })
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                user,
                orders
            }
        });
    } catch (error) {
        res.status(404).json({ 
            success: false,
            message: 'Utilisateur non trouvé' 
        });
    }
};

// Mettre à jour les information d'un utilisateur


// Ajout d'un profile utilisateur
exports.getMyProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  res.json({
    success: true,
    data: user
  });
};

// Modifier les informations personnelles d'un user
exports.updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    user.name = req.body.name ?? user.name;
    user.phone = req.body.phone ?? user.phone;
    user.neighborhood = req.body.neighborhood ?? user.neighborhood;

    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profil mis à jour',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        neighborhood: user.neighborhood,
        avatar: user.avatar
      }
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Modifier le mot de passe d'un user 

exports.updateMyPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Mot de passe modifié avec succès'
  });
};


// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ 
            success: true,
            message: 'Utilisateur supprimé avec succès' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Obtenir le nombre total d'utilisateurs
exports.getUserCount = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({ 
            success: true,
            count: userCount 
        });
    } catch (error) {
        console.error('Erreur lors du comptage des utilisateurs:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors du comptage des utilisateurs' 
        });
    }
};

// Obtenir les statistiques utilisateur
exports.getUserStats = async (req, res) => {
    try {
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: {
                        $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                    }
                }
            }
        ]);

        const stats = userStats.length > 0 ? userStats[0] : { totalUsers: 0, activeUsers: 0 };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
};