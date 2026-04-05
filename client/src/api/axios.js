import axios from "axios";

// Nettoyage de l'URL du .env (enlève les espaces et slashs de fin)
const rawUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").trim().replace(/\/+$/, "");

// On s'assure que l'URL finit par /api
const BASE_API_URL = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;

const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axios.post(`${BASE_API_URL}/auth/refresh`, {}, { withCredentials: true })
          .then((res) => {
            const { accessToken } = res.data;
            localStorage.setItem("accessToken", accessToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            processQueue(null, accessToken);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            // Optionnel: window.location.href = "/login";
            // Si on est sur une page sensible (comme checkout), on redirige
            if (window.location.pathname === "/checkout") {
              window.location.href = "/login?message=session_expired";
            }
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(error);
  }
);

export default api;