import axios from "axios";

/* =========================
   BASE URL CLEAN
========================= */
const rawUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000")
  .trim()
  .replace(/\/+$/, "");

const BASE_API_URL = rawUrl.endsWith("/api")
  ? rawUrl
  : `${rawUrl}/api`;

/* =========================
   INSTANCE AXIOS
========================= */
const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true, // 🔥 obligatoire pour cookies (refreshToken)
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REFRESH MANAGEMENT
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

/* =========================
   REQUEST INTERCEPTOR (AUTH + CSRF)
========================= */
api.interceptors.request.use(
  (config) => {
    // 🔐 ACCESS TOKEN
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // 🛡️ CSRF TOKEN
    const csrfToken = localStorage.getItem("csrfToken");
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR (AUTO REFRESH)
========================= */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ❌ Si pas de réponse → problème réseau / CORS / serveur down
    if (!error.response) {
      console.error("🚨 Network / CORS error:", error);
      return Promise.reject(error);
    }

    // 🔄 TOKEN EXPIRE → REFRESH
    if (error.response.status === 401 && !originalRequest._retry) {

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

      try {
        const res = await axios.post(
          `${BASE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = res.data;

        // 🔥 Update storage
        localStorage.setItem("accessToken", accessToken);

        // 🔥 Update headers globaux
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        return api(originalRequest);

      } catch (err) {
        processQueue(err, null);

        // ❌ Nettoyage complet
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        // Redirection intelligente
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?session=expired";
        }

        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;