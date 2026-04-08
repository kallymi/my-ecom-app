import axios from "axios";

// Utilise la variable d'environnement de Vite, ou l'URL par défaut si elle n'existe pas
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  withCredentials: true,
});

// INTERCEPTEUR DE REQUÊTE : On ajoute le token manuellement
api.interceptors.request.use((config) => {
  // On récupère le token stocké (on va l'appeler 'adminToken')
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expirée ou non autorisée");
      // Optionnel: localStorage.removeItem("adminToken"); 
    }
    return Promise.reject(error);
  }
);

export default api;