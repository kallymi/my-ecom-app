import axios from "axios";

export const API_URL = "http://192.168.100.6:5000/api";

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