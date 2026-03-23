const cron = require('node-cron');
const Order = require('../models/orderModel'); 

const startRevenueTask = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('--- Lancement du nettoyage du CA ---');

    try {
      const now = new Date();

      const result = await Order.updateMany(
        {
          status: 'DELIVERED',
          isRevenueCounted: false,
          items: {
            $not: {
              $elemMatch: {
                returnDeadline: { $gte: now }
              }
            }
          }
        },
        {
          $set: { isRevenueCounted: true }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ ${result.modifiedCount} commandes ajoutées au CA réel.`);
      } else {
        console.log('Aucune commande prête pour comptabilisation.');
      }

    } catch (error) {
      console.error('Erreur Job CA:', error);
    }
  });

  console.log("📊 Revenue job initialisé");
};

module.exports = startRevenueTask;