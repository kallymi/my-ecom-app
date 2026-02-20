const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");

/**
 * @desc    Statistiques Chiffre d’Affaires (ADMIN)
 * @route   GET /api/admin/stats/revenue
 * @access  Private/Admin
 */
const getRevenueStats = asyncHandler(async (req, res) => {
  const now = new Date();

  /* =========================
     CA VALIDÉ
  ========================= */
  const validatedRevenue = await Order.aggregate([
    {
      $match: {
        isRevenueCounted: true,
        status: "DELIVERED"
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
        count: { $sum: 1 }
      }
    }
  ]);

  /* =========================
     CA EN ATTENTE (livré mais retournable)
  ========================= */
  const pendingRevenue = await Order.aggregate([
    {
      $match: {
        status: "DELIVERED",
        isRevenueCounted: false,
        "items.returnDeadline": { $gte: now }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
        count: { $sum: 1 }
      }
    }
  ]);

  /* =========================
     COMMANDES RETOURNÉES
  ========================= */
  const returnedOrders = await Order.countDocuments({
    status: "RETURNED"
  });

  /* =========================
     PANIER MOYEN (CA validé)
  ========================= */
  const avgBasket =
    validatedRevenue[0]?.count > 0
      ? validatedRevenue[0].total / validatedRevenue[0].count
      : 0;

  res.json({
    success: true,
    revenue: {
      validated: validatedRevenue[0]?.total || 0,
      pending: pendingRevenue[0]?.total || 0,
      returnedOrders,
      validatedOrders: validatedRevenue[0]?.count || 0,
      averageBasket: Math.round(avgBasket)
    }
  });
});

module.exports = { getRevenueStats };
