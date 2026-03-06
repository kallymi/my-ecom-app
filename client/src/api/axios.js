import axios from 'axios';

// 1. Nettoyage de l'URL
const rawUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CLEAN_URL = rawUrl.replace(/["';]/g, "").trim();

console.log("🛠 TEST CONNEXION AXIOS vers :", CLEAN_URL);
/**
 * 2. Construction de l'URL de base avec /api
 * On vérifie si CLEAN_URL finit déjà par /api pour ne pas le mettre deux fois
 */
const BASE_API_URL = CLEAN_URL.endsWith('/api') 
  ? CLEAN_URL 
  : `${CLEAN_URL}/api`;

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// LOG DE DEBUG : Clique sur ce lien dans ta console F12 pour vérifier s'il affiche tes produits
console.log("🔌 Instance Axios connectée sur :", BASE_API_URL);

// 3. Intercepteur pour le Token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;




