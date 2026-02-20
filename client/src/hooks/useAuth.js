import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }

  const { user, login: contextLogin, register: contextRegister, logout: contextLogout } = context;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const login = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await contextLogin(formData.email, formData.password);
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Erreur de connexion");
      throw err;
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await contextRegister(formData.name, formData.email, formData.password);
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Erreur d'inscription");
      throw err;
    }
  };

  const logout = () => {
    contextLogout();
    setIsAuthenticated(false);
  };

  return {
    user,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated
  };
};
