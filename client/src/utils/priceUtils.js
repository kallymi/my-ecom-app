exports.getEffectivePrice = (product) => {
  const now = new Date();

  if (
    product.promotion &&
    product.promotion.isActive &&
    product.promotion.startDate <= now &&
    product.promotion.endDate >= now
  ) {
    if (product.promotion.type === 'percentage') {
      return product.price - (product.price * product.promotion.value) / 100;
    }

    if (product.promotion.type === 'fixed') {
      return Math.max(0, product.price - product.promotion.value);
    }
  }

  return product.price;
};
