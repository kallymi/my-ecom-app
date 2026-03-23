const cron = require('node-cron');
const Order = require('../orderModel'); // Vérifie bien ton chemin d'import

// S'exécute toutes les nuits à minuit
cron.schedule('0 0 * * *', async () => {
  const now = new Date();
  
  try {
    // On utilise le Snapshot racine : sécurité totale
    const result = await Order.updateMany(
      {
        status: 'DELIVERED',
        isRevenueCounted: false,
        // On vérifie que la date limite globale est bien passée
        finalReturnDeadline: { $exists: true, $ne: null, $lt: now }
      },
      { 
        $set: { isRevenueCounted: true } 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Revenue Job: ${result.modifiedCount} commandes validées.`);
    }
  } catch (err) {
    console.error("❌ Erreur Revenue Job:", err);
  }
});