const Coupon = require('../models//couponModel');

exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    // 1. Vérifier si le coupon existe
    if (!coupon) {
      return res.status(404).json({ message: "Code promo invalide ou expiré." });
    }

    // 2. Vérifier la date d'expiration
    if (new Date() > coupon.expirationDate) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(400).json({ message: "Ce code a expiré." });
    }

    // 3. Vérifier le montant minimum
    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Ce code nécessite un achat minimum de ${coupon.minOrderAmount} F.` 
      });
    }

    // 4. Vérifier la limite d'utilisation
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Ce code a atteint sa limite d'utilisation." });
    }

    // 5. Calculer la réduction
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENT') {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      message: "Coupon appliqué !",
      discountAmount,
      newTotal: cartTotal - discountAmount,
      couponCode: coupon.code
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la validation." });
  }
};