const User = require('../models/userModel');
const Order = require('../models/orderModel');

// Obtenir tous les utilisateurs (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Obtenir un utilisateur par son ID (Admin)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const orders = await Order.find({ user: req.params.id })
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { user, orders }
        });
    } catch (error) {
        res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
};

// Supprimer un utilisateur (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Obtenir le nombre total d'utilisateurs (Admin/Dashboard)
exports.getUserCount = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({ success: true, count: userCount });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors du comptage des utilisateurs' });
    }
};

// Obtenir les statistiques utilisateur (Admin/Dashboard)
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
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
    }
};