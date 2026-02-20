import axios from 'axios';
import { Beaker } from "@heroicons/react/24/outline";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const cartService = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },

  addToCart: async (productId, quantity, price) => {
    // On envoie le prix au backend pour qu'il puisse valider/enregistrer le prix promo
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

  getCartCount: () => {
    api.get("/cart?count")
  },
    

  checkout: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  }
};
