import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";           // ✅ ajouté
import api from "../api/axios";

export const AuthContext = createContext();

const BASE_API_URL = (
  (process.env.REACT_APP_API_URL || "http://localhost:5000")
    .trim()
    .replace(/\/+$/, "")
).endsWith("/api")
  ? (process.env.REACT_APP_API_URL || "http://localhost:5000").trim().replace(/\/+$/, "")
  : `${(process.env.REACT_APP_API_URL || "http://localhost:5000").trim().replace(/\/+$/, "")}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);

  const isAuthenticated = !!user;

  const formatUser = useCallback((userData) => {
    if (!userData) return null;
    return { ...userData, email: userData.email?.toLowerCase().trim() };
  }, []);

  // ✅ logout défini EN PREMIER pour être disponible dans initAuth
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout API failed");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  /* =========================
     CSRF TOKEN
  ========================= */
  useEffect(() => {
    const fetchCSRF = async () => {
      try {
        // ✅ axios direct avec BASE_API_URL correctement défini
        const res = await axios.get(`${BASE_API_URL}/csrf-token`, {
          withCredentials: true,
        });
        const token = res.data.csrfToken;
        if (token) {
          localStorage.setItem("csrfToken", token);
          api.defaults.headers.common["x-csrf-token"] = token;
        }
      } catch (err) {
        console.error("Erreur CSRF fetch:", err);
      }
    };
    fetchCSRF();
  }, []);

  /* =========================
     INIT AUTH
  ========================= */
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const hasToken = localStorage.getItem("accessToken");
        if (!hasToken) {
          setInitializing(false);
          return;
        }

        const res = await api.get("/auth/me");

        if (isMounted && res.data?.user) {
          const formatted = formatUser(res.data.user);
          setUser(formatted);
          localStorage.setItem("user", JSON.stringify(formatted));
        }
      } catch (err) {
        if (isMounted) {
          console.error("Échec init auth:", err.message);
          if (err.response?.status === 401 || err.response?.status === 403) {
            setUser(null);
            localStorage.clear();
          }
          // ✅ logout est maintenant bien défini ici
          logout();
        }
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    initAuth();
    return () => { isMounted = false; };
  }, [formatUser, logout]);

  /* =========================
     LOGIN
  ========================= */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post("/auth/login", {
        ...credentials,
        email: credentials.email.toLowerCase().trim(),
      });
      const { user, accessToken } = res.data;
      const formattedUser = formatUser(user);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(formattedUser));
      setUser(formattedUser);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Erreur de connexion";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     REGISTER
  ========================= */
  const register = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post("/auth/register", {
        ...data,
        email: data.email.toLowerCase().trim(),
      });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Erreur inscription";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     VERIFY OTP
  ========================= */
  const verifyOtp = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post("/auth/verify-otp", data);
      const { user, accessToken } = res.data;
      const formattedUser = formatUser(user);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(formattedUser));
      setUser(formattedUser);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "OTP invalide";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOGIN WITH GOOGLE
  ========================= */
  const loginWithGoogle = async (googleAccessToken) => {
    try {
      setLoading(true);
      setError(null);

      const csrfToken = localStorage.getItem("csrfToken");

      const res = await api.post(
        "/auth/google",
        { token: googleAccessToken },
        { headers: { "x-csrf-token": csrfToken } }
      );

      const { user, accessToken } = res.data;
      const formattedUser = formatUser(user);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(formattedUser));
      setUser(formattedUser);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || "Échec connexion Google";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UPDATE USER
  ========================= */
  const updateUser = useCallback((newData) => {
    setUser((prev) => {
      const updated = formatUser({ ...prev, ...newData });
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, [formatUser]);

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated,
      login, register, verifyOtp, loginWithGoogle, logout, updateUser,
      loading, error, setError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return context;
};