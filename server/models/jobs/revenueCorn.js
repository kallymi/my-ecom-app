const cron = require('node-cron');
const Order = require('../orderModel');

const startRevenueTask = () => {
  // S'exécute chaque jour à 00:01
  cron.schedule('1 0 * * *', async () => {
    console.log('--- ⏳ Vérification des revenus clôturés ---');
    const now = new Date();

    try {
      // On cherche les commandes DELIVERED dont TOUS les articles ont dépassé le deadline
      const result = await Order.updateMany(
        {
          status: 'DELIVERED',
          isRevenueCounted: false,
          'items.returnDeadline': { $lt: now }
        },
        { $set: { isRevenueCounted: true } }
      );

      console.log(`✅ ${result.modifiedCount} commandes ont été définitivement ajoutées au CA.`);
    } catch (error) {
      console.error('❌ Erreur Cron Job:', error);
    }
  });
};

module.exports = startRevenueTask;