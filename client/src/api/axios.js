import axios from 'axios';

// 1. Nettoyage de l'URL (enlève guillemets, espaces et points-virgules accidentels)
const rawUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const CLEAN_URL = rawUrl.replace(/["';]/g, "").trim();

// 2. Construction de l'URL de base
const BASE_API_URL = `${CLEAN_URL}`;

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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