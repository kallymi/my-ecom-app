import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const isAuthenticated = !!user;

  // ===============================
  // UTILITAIRE : Formatage Utilisateur
  // ===============================
  const formatUser = useCallback((userData) => {
    if (!userData) return null;
    
    // On s'assure que l'e-mail est toujours traité en minuscules (Sécurité & Consistance)
    const formatted = { ...userData };
    if (formatted.email) {
      formatted.email = formatted.email.toLowerCase().trim();
    }
    return formatted;
  }, []);

  // ===============================
  // VERIFICATION AUTH AU DEMARRAGE
  // ===============================
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // On force withCredentials pour être sûr que l'IP envoie le cookie
        const res = await api.get("/auth/me"); 
        
        if (res.data?.user) {
          setUser(formatUser(res.data.user));
        } else {
          // Si pas de user dans la data, on considère déconnecté
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setInitializing(false);
      }
    };
    checkAuthStatus();
  }, [formatUser]);

  // ===============================
  // LOGIN
  // ===============================
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...credentials,
        email: credentials.email.toLowerCase().trim()
      };

      const res = await api.post("/auth/login", payload);
      const userData = formatUser(res.data.user);

      setUser(userData);
      return res.data; 
    } catch (err) {
      const message = err.response?.data?.message || "Identifiants incorrects";
      setError(message);
      throw new Error(message); 
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // REGISTER
  // ===============================
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...userData,
        email: userData.email.toLowerCase().trim()
      };

      const res = await api.post("/auth/register", payload);
      return res.data; // On attend l'OTP, donc pas de setUser ici
      
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'inscription";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOGOUT (Version Radicale & Propre)
  // ===============================
  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };

  // ===============================
  // UPDATE / REFRESH USER
  // ===============================
  const updateUser = useCallback((newData) => {
    setUser((prevUser) => {
      const updated = formatUser({ ...prevUser, ...newData });
      // localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, [formatUser]);

  // ===============================
  // PROTECTION DU RENDU
  // ===============================
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-500 border-opacity-50"></div>
          <p className="text-slate-500 font-medium animate-pulse">Sécurisation de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        loading,
        error,
        setError, // Utile pour reset l'erreur depuis les formulaires
        isAuthenticated,
        initializing
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  return context;
};