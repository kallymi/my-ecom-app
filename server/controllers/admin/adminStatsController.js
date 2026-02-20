const asyncHandler = require('express-async-handler');
const User = require('../../models/userModel');
const Product = require('../../models/productModel');
const Order = require('../../models/orderModel');

const getAdminStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [counts, revenueData, latestOrders, chartDataAgg, lowStock] = await Promise.all([
    // 1. Les compteurs simples
    Promise.all([
      Product.countDocuments({ isDeleted: false }),
      Order.countDocuments(),
      User.countDocuments()
    ]),

    // 2. Calcul des revenus (Validé vs Encours)
    Order.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: null,
          validated: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$status", "DELIVERED"] },
                  { $eq: ["$isRevenueCounted", true] }
                ]},
                "$totalAmount",
                0
              ]
            }
          },
          pending: {
            $sum: {
              $cond: [
                { $or: [
                  { $ne: ["$status", "DELIVERED"] },
                  { $eq: ["$isRevenueCounted", false] }
                ]},
                "$totalAmount",
                0
              ]
            }
          }
        }
      }
    ]),

    // 3. Dernières commandes
    Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name"),

    // 4. Graphique
    Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]),

    // 5. Stocks bas
    Product.find({ stock: { $lt: 10 }, isDeleted: false }).limit(5)
  ]);

  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  res.json({
    success: true,
    counts: { products: counts[0], orders: counts[1], users: counts[2] },
    revenue: {
      validated: revenueData[0]?.validated || 0,
      pending: revenueData[0]?.pending || 0,
      averageBasket: counts[1] > 0 ? ((revenueData[0]?.validated || 0) + (revenueData[0]?.pending || 0)) / counts[1] : 0
    },
    latestOrders,
    chartData: chartDataAgg.map(item => ({
      name: days[new Date(item._id).getDay()],
      revenue: item.revenue
    })),
    lowStockProducts: lowStock
  });
});

module.exports = { getAdminStats };