import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Vérifie la session au chargement de l'application
   * Appelle /auth/me pour récupérer l'utilisateur si cookie valide
   */
  useEffect(() => {

    let isMounted = true;

    const checkAuth = async () => {

      try {

        const res = await api.get("/auth/me");

        if (isMounted && res.data?.user) {
          setUser(res.data.user);
        }

      // Remplace ton bloc catch dans checkAuth
      } catch (err) {
        // Seul le 401 signifie "vraiment pas connecté"
        if (err.response?.status === 401) {
          setUser(null);
        } else {
          // Si c'est un timeout ou autre, on laisse setUser tel quel 
          // ou on gère une erreur spécifique pour éviter la déconnexion forcée
          console.warn("Auth check failed:", err?.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }

    };

    checkAuth();

    return () => {
      isMounted = false;
    };

  }, []);

  /**
   * LOGIN
   * Mise à jour de l'utilisateur après succès API
   */
  const login = (userData) => {
    setUser(userData);
  };

  /**
   * LOGOUT
   * Déconnexion serveur + reset local
   */
  const logout = async () => {

    try {

      await api.post("/auth/logout");

    } catch (err) {

      console.error("Logout error:", err);

    } finally {

      setUser(null);

    }

  };

  /**
   * Rafraîchir les données utilisateur depuis le serveur
   */
  const refreshUser = async () => {

    try {

      const res = await api.get("/auth/me");

      if (res.data?.user) {
        setUser(res.data.user);
      }

    } catch (err) {

      console.error("Refresh user failed:", err);

    }

  };

  /**
   * Mise à jour locale des données utilisateur
   */
  const updateUser = (newData) => {

    setUser((prev) => ({
      ...prev,
      ...newData
    }));

  };

  const value = {
    user,
    login,
    logout,
    refreshUser,
    updateUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

}

/**
 * Hook personnalisé pour utiliser facilement le contexte
 */
export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }

  return context;

};