import api from '../api/axios';

/**
 * 1. CONFIGURATION DE L'URL
 * On utilise l'IP .29.19. 
 * Note : On ne met PAS '/api' ici si on l'ajoute plus bas dans baseURL.
 */
// const API_URL_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// const api = axios.create({
//   // Ici, on s'assure que toutes les requêtes commencent par http://IP:5000/api
//   baseURL: `${API_URL_BASE}/api`,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Log de contrôle pour la console F12
// console.log("📡 Mode Connexion :", API_URL_BASE + "/api");

// /**
//  * 2. INTERCEPTEUR JWT
//  * Ajoute automatiquement le token de sécurité à chaque requête
//  */
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

/**
 * 3. EXPORT DES SERVICES
 */
export const productService = {
  // Récupérer les produits (version courte)
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Récupérer tous les produits (avec gestion d'erreur)
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération produits:', error);
      throw error;
    }
  },

  // Récupérer un produit par ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur produit ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les produits par catégorie
  getProductsByCategory: async (category) => {
    try {
      const response = await api.get(`/products/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Erreur catégorie ${category}:`, error);
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
      console.error('❌ Erreur recherche:', error);
      throw error;
    }
  },

  // Produits à la une
  getFeaturedProducts: async (limit = 8) => {
    try {
      const response = await api.get('/products/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur produits populaires:', error);
      throw error;
    }
  },

  // Nouveautés
  getNewArrivals: async (limit = 8) => {
    try {
      const response = await api.get('/products/new', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur nouveautés:', error);
      throw error;
    }
  }
};


