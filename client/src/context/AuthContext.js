import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // --- STATE INITIAL ---
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem("token");
    return saved && saved !== "undefined" ? saved : null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const isAuthenticated = !!token && !!user;

  // --- INITIALISATION AU DÉMARRAGE ---
  useEffect(() => {
    const initAuth = async () => {
      if (token && !user) {
        await refreshUser(token);
      }
      setInitializing(false);
    };

    initAuth();
  }, []);

  // ===============================
  // LOGIN
  // ===============================
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const cleanCredentials = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password.trim(),
      };

      const res = await api.post("/auth/login", cleanCredentials);

      const { token: newToken, user: userData } = res.data;

      // 🔥 Mise à jour immédiate du state
      setToken(newToken);
      setUser(userData);

      // 🔥 Sync localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Problème de connexion au serveur";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // REGISTER
  // ===============================
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const cleanData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
      };

      const res = await api.post("/auth/register", cleanData);

      const { token: newToken, user: userData } = res.data;

      setToken(newToken);
      setUser(userData);

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors de l'inscription";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOGOUT
  // ===============================
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ===============================
  // REFRESH USER
  // ===============================
  const refreshUser = async (authToken = token) => {
    if (!authToken) return;

    try {
      const res = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const userData = res.data.user || res.data.data || res.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

    } catch (err) {
      console.error("Erreur refresh user:", err);
      logout(); // Token invalide → on nettoie
    }
  };

  // ===============================
  // UPDATE USER
  // ===============================
  const updateUser = (updatedUser) => {
    if (!updatedUser) return;
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
        loading,
        error,
        isAuthenticated,
        initializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);