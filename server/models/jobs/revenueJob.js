const cron = require('node-cron');
const Order = require('../orderModel');

// S'exécute toutes les nuits à minuit
cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  
  try {
    const result = await Order.updateMany(
      {
        status: 'DELIVERED',
        isRevenueCounted: false,
        'items.returnDeadline': { $lt: now } // Délai dépassé
      },
      { $set: { isRevenueCounted: true } }
    );
    console.log(`✅ Revenue Job: ${result.modifiedCount} commandes validées.`);
  } catch (err) {
    console.error("❌ Erreur Revenue Job:", err);
  }
});