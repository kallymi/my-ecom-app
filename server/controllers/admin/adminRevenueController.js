const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");

const getRevenueStats = asyncHandler(async (req, res) => {
  const now = new Date();

  const stats = await Order.aggregate([
    // On ne compte que ce qui est livré (l'argent est encaissé)
    { $match: { status: "DELIVERED" } },

    {
      $addFields: {
        // Sécurité : on récupère la deadline, si elle n'existe pas, on met une date très ancienne
        finalReturnDeadline: { 
          $ifNull: [{ $max: "$items.returnDeadline" }, new Date(0)] 
        }
      }
    },

    {
      $group: {
        _id: null,
        // CA VALIDÉ : Déjà compté OU (Deadline passée)
        validatedRevenue: {
          $sum: {
            $cond: [
              { 
                $or: [
                  { $eq: ["$isRevenueCounted", true] },
                  { $lt: ["$finalReturnDeadline", now] }
                ]
              },
              "$totalAmount",
              0
            ]
          }
        },
        // CA EN ATTENTE : Pas encore compté ET Deadline futur
        pendingRevenue: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $eq: ["$isRevenueCounted", false] },
                  { $gt: ["$finalReturnDeadline", now] },
                  { $ne: ["$finalReturnDeadline", new Date(0)] } // Exclure les anciennes commandes sans deadline
                ]
              },
              "$totalAmount",
              0
            ]
          }
        },
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  const result = stats[0] || { validatedRevenue: 0, pendingRevenue: 0, totalOrders: 0 };

  // On récupère aussi le nombre total de commandes (tous statuts confondus) pour le Dashboard
  const globalCount = await Order.countDocuments();

  res.json({
    success: true,
    ordersCount: globalCount, // Correction ici pour ton Dashboard
    revenue: {
      validated: result.validatedRevenue,
      pending: result.pendingRevenue,
      totalEncaisse: result.validatedRevenue + result.pendingRevenue,
      averageBasket: result.totalOrders > 0 
        ? Math.round(result.validatedRevenue / result.totalOrders) 
        : 0
    }
  });
});

module.exports = { 
  getRevenueStats, 
};