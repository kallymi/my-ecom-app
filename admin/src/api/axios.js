import axios from "axios";

export const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      // CHANGE CECI :
      window.location.href = "/login"; // Au lieu de "/admin/login"
    }
    return Promise.reject(error);
  }
);

export default api;
