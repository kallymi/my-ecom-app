const asyncHandler = require('express-async-handler');
const User = require('../../models/userModel');
const Product = require('../../models/productModel');
const Order = require('../../models/orderModel');

const getAdminStats = asyncHandler(async (req, res) => {
  const now = new Date();

  // =============================
  // 📅 PÉRIODES
  // =============================
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 7 jours incluant aujourd’hui

  // =============================
  // ⚡ REQUÊTES PARALLÈLES
  // =============================
  const [
    counts,
    dailyStatsAgg,
    totalRevenueAgg,
    latestOrders,
    lowStock,
    todayRevenueAgg,
    extraStats
  ] = await Promise.all([

    // --- COMPTEURS ---
    Promise.all([
      Product.countDocuments({ isDeleted: false }),
      Order.countDocuments(),
      User.countDocuments()
    ]),

    // =============================
    // 📊 GRAPH (7 jours)
    // =============================
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $nin: ['CANCELLED', 'RETURNED'] }
        }
      },
      {
        $project: {
          totalAmount: 1,
          createdAt: 1,
          isValidated: {
            $and: [
              { $eq: ["$status", "DELIVERED"] },
              {
                $or: [
                  { $eq: ["$isRevenueCounted", true] },
                  { $lt: ["$finalReturnDeadline", now] }
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Africa/Ndjamena"
            }
          },
          caValide: {
            $sum: { $cond: ["$isValidated", "$totalAmount", 0] }
          },
          enAttente: {
            $sum: { $cond: [{ $not: "$isValidated" }, "$totalAmount", 0] }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]),

    // =============================
    // 💰 CA GLOBAL (TOTAL)
    // =============================
    Order.aggregate([
      {
        $match: {
          status: { $nin: ['CANCELLED', 'RETURNED'] }
        }
      },
      {
        $project: {
          totalAmount: 1,
          createdAt: 1,
          isValidated: {
            $and: [
              { $eq: ["$status", "DELIVERED"] },
              {
                $or: [
                  { $eq: ["$isRevenueCounted", true] },
                  {
                    $and: [
                      { $ne: ["$finalReturnDeadline", null] },
                      { $lt: ["$finalReturnDeadline", now] }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          validated: {
            $sum: { $cond: ["$isValidated", "$totalAmount", 0] }
          },
          pending: {
            $sum: { $cond: [{ $not: "$isValidated" }, "$totalAmount", 0] }
          }
        }
      }
    ]),

    // --- DERNIÈRES COMMANDES ---
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name"),

    // --- STOCK FAIBLE ---
    Product.find({ stock: { $lt: 10 }, isDeleted: false }).limit(5),

    // --- CA DU JOUR ---
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          status: { $nin: ['CANCELLED', 'RETURNED'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]),

    // --- AUTRES STATS ---
    Promise.all([
      Order.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Order.countDocuments({ status: { $in: ['PENDING', 'PROCESSING'] } }),
      Order.countDocuments({ status: 'RETURN_REQUESTED' }),
      User.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Order.countDocuments({ status: 'SHIPPING' })
    ])
  ]);

  // =============================
  // 📊 COMPLETER LES JOURS MANQUANTS
  // =============================
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const map = Object.fromEntries(
    dailyStatsAgg.map(item => [item._id, item])
  );

  const chartData = last7Days.map(date => {
    const item = map[date];

    return {
      name: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
      caValide: item?.caValide || 0,
      enAttente: item?.enAttente || 0
    };
  });

  // =============================
  // 💰 CA GLOBAL FINAL
  // =============================
  const globalRevenue = totalRevenueAgg[0] || {
    validated: 0,
    pending: 0
  };

  const totalOrdersCount = counts[1];

  // =============================
  // 🚀 RESPONSE
  // =============================
  res.json({
    success: true,

    counts: {
      products: counts[0],
      orders: totalOrdersCount,
      users: counts[2]
    },

    todayOrderCount: extraStats[0],
    pendingProcessingCount: extraStats[1],
    pendingReturns: extraStats[2],
    newClientsToday: extraStats[3],
    expectedDeliveries: extraStats[4],

    todayRevenue: todayRevenueAgg[0]?.total || 0,

    revenue: {
      validated: globalRevenue.validated,
      pending: globalRevenue.pending,
      averageBasket:
        totalOrdersCount > 0
          ? (globalRevenue.validated + globalRevenue.pending) / totalOrdersCount
          : 0
    },

    latestOrders,
    chartData,
    lowStockProducts: lowStock
  });
  
});


module.exports = { getAdminStats };