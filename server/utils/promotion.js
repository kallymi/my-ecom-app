// utils/promotion.js
const isPromotionActive = (promotion) => {
  if (!promotion || !promotion.isActive) return false;

  const now = new Date();
  return now >= new Date(promotion.startDate)
      && now <= new Date(promotion.endDate);
};

const calculateFinalPrice = (price, promotion) => {
  if (!isPromotionActive(promotion)) {
    return {
      finalPrice: price,
      discount: 0,
      hasPromotion: false
    };
  }

  let discount = 0;

  if (promotion.type === 'percentage') {
    discount = (price * promotion.value) / 100;
  }

  if (promotion.type === 'fixed') {
    discount = promotion.value;
  }

  const finalPrice = Math.max(price - discount, 0);

  return {
    finalPrice,
    discount,
    hasPromotion: true,
    promotion
  };
};

module.exports = {
  isPromotionActive,
  calculateFinalPrice
};
