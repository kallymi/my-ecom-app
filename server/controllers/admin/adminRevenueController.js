const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");

const getRevenueStats = asyncHandler(async (req, res) => {
  const now = new Date();
  
  // 1. Période du graphique
  const daysToBack = req.query.period === 'month' ? 30 : 7;
  const startDate = new Date();
  startDate.setDate(now.getDate() - daysToBack);

  const [globalStats, chartDataRaw, globalCount] = await Promise.all([
    // --- REQUÊTE 1 : TOTAUX GLOBAUX (Cartes KPI) ---
    Order.aggregate([
      { $match: { status: "DELIVERED" } },
      {
        $group: {
          _id: null,
          validatedRevenue: {
            $sum: {
              $cond: [
                { 
                  $or: [
                    { $eq: ["$isRevenueCounted", true] },
                    { $lt: ["$finalReturnDeadline", now] } // Utilise le champ direct de ta DB
                  ]
                },
                "$totalAmount",
                0
              ]
            }
          },
          pendingRevenue: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ["$isRevenueCounted", false] },
                    { $gt: ["$finalReturnDeadline", now] }
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
    ]),

    // --- REQUÊTE 2 : DONNÉES DU GRAPHIQUE ---
    Order.aggregate([
      { 
        $match: { 
          status: "DELIVERED",
          createdAt: { $gte: startDate } 
        } 
      },
      {
        $group: {
          // On groupe par jour de création
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          caValide: {
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
          enAttente: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ["$isRevenueCounted", false] },
                    { $gt: ["$finalReturnDeadline", now] }
                  ]
                },
                "$totalAmount",
                0
              ]
            }
          }
        }
      },
      { $sort: { "_id": 1 } }
    ]),

    Order.countDocuments()
  ]);

  const result = globalStats[0] || { validatedRevenue: 0, pendingRevenue: 0, totalOrders: 0 };

  // Formatage pour Recharts
  const formattedChartData = chartDataRaw.map(item => {
    const [year, month, day] = item._id.split('-');
    return {
      name: `${day}/${month}`,
      caValide: item.caValide,
      enAttente: item.enAttente
    };
  });

  res.json({
    success: true,
    ordersCount: globalCount,
    revenue: {
      validated: result.validatedRevenue,
      pending: result.pendingRevenue,
      totalEncaisse: result.validatedRevenue + result.pendingRevenue,
      averageBasket: result.totalOrders > 0 
        ? Math.round(result.validatedRevenue / result.totalOrders) 
        : 0
    },
    chartData: formattedChartData 
  });
});

module.exports = { getRevenueStats };