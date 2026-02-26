import { createContext, useState, useContext } from "react";
import axios from "axios";
import api from "../api/axios";
import { useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return savedToken && savedToken !== "undefined" ? savedToken : null;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await refreshUser();
      }
      setInitializing(false);
    };

    initAuth();
  }, [token]);

  const isAuthenticated = !!token && !!user;

  // --- LOGIN ---
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      // NETTOYAGE SÉCURITÉ MOBILE
      const cleanCredentials = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password.trim()
      };

      // UTILISATION DE L'INSTANCE AXIOS (avec l'IP au lieu de localhost)
      const res = await api.post("/auth/login", cleanCredentials);

      const { token: newToken } = res.data;
      setToken(newToken);
      localStorage.setItem("token", newToken);
      await refreshUser(newToken);

    } catch (err) {
      // Amélioration du message d'erreur pour le debug
      const message = err.response 
        ? err.response.data?.message 
        : "Problème de connexion au serveur (Vérifiez l'IP)";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  // --- REGISTER ---
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const { name, email, password } = formData;
      const res = await axios.post("http://localhost:5000/api/auth/register", { name, email, password });

      const { token: newToken, user: userData } = res.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };


  // --- UPDATE USER (après modification du profil) ---
  const updateUser = (updatedUser) => {
    if (!updatedUser) return;

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // --- REFRESH USER ---
  const refreshUser = async (authToken = token) => {
    if (!authToken) return;

    try {
      const res = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const userData = res.data.user || res.data.data;
      updateUser(userData);
    } catch (err) {
      console.error("Impossible de rafraîchir l'utilisateur", err);
    }
  };


  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        login,
        register,
        logout,
        refreshUser, // 🔥 IMPORTANT
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
