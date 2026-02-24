import api from '../api/axios'; // Import de l'instance centralisée avec l'IP

export const cartService = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },

  addToCart: async (productId, quantity, price) => {
    const res = await api.post('/cart/add', { productId, quantity, price });
    return res.data;
  },

  updateCartItem: async (productId, quantity) => {
    const res = await api.put(`/cart/update/${productId}`, { quantity });
    return res.data;
  },

  removeFromCart: async (productId) => {
    const res = await api.delete(`/cart/remove/${productId}`);
    return res.data;
  },

  clearCart: async () => {
    const res = await api.delete('/cart/clear');
    return res.data;
  },

  getCartCount: async () => {
    const res = await api.get("/cart?count");
    return res.data;
  },

  checkout: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  }
};