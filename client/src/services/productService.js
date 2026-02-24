import axios from 'axios';

// Ajoute ce log pour voir EXACTEMENT ce que React lit
console.log("DEBUG API URL:", process.env.REACT_APP_API_URL);

// On s'assure que baseURL est bien formé
const baseURL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL 
  : 'http://172.16.29.19:5000';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});
// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const productService = {
  // Récupérer les produits
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  // Récupérer tous les produits
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      throw error;
    }
  },

  // Récupérer un produit par ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération produit ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les produits par catégorie
  getProductsByCategory: async (category) => {
    try {
      const response = await api.get(`/products/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur récupération catégorie ${category}:`, error);
      throw error;
    }
  },

  // Rechercher des produits
  searchProducts: async (query, params = {}) => {
    try {
      const response = await api.get('/products/search', {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur recherche produits:', error);
      throw error;
    }
  },

  // Récupérer les produits populaires
  getFeaturedProducts: async (limit = 8) => {
    try {
      const response = await api.get('/products/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur produits populaires:', error);
      throw error;
    }
  },

  // Récupérer les nouvelles arrivées
  getNewArrivals: async (limit = 8) => {
    try {
      const response = await api.get('/products/new', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur nouvelles arrivées:', error);
      throw error;
    }
  }
};