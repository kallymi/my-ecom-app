import axios from "axios";

export const API_URL = "http://172.16.36.89:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  withCredentials: true,
});

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("adminToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
