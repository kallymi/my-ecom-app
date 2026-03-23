import axios from 'axios';

// 1. Nettoyage de l'URL
const rawUrl = process.env.REACT_APP_API_URL || 'http://172.16.36.89:5000'; // Priorité à l'IP réseau
const CLEAN_URL = rawUrl.replace(/["';]/g, "").trim();

const BASE_API_URL = CLEAN_URL.endsWith('/api') 
  ? CLEAN_URL 
  : `${CLEAN_URL}/api`;

const api = axios.create({
  baseURL: BASE_API_URL,
  // 🛡️ CRUCIAL : Permet au navigateur d'inclure le cookie 'token' dans chaque requête
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 2. Intercepteur de Réponse (Optionnel mais recommandé)
 * Si le serveur renvoie une 401 (Non autorisé), on peut forcer la déconnexion
 * propre côté client si le cookie est expiré.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si on reçoit une 401, cela signifie que le cookie n'est plus valide
      // On peut nettoyer le localStorage par précaution
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;