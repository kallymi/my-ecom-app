// src/context/AuthContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  toast,
} from "react";

import api from "../api/axios";

/* =========================
   CONTEXT
========================= */
export const AuthContext = createContext();

/* =========================
   PROVIDER
========================= */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  /* =========================
     FORMAT USER
  ========================= */
  const formatUser = useCallback((userData) => {
    if (!userData) return null;

    return {
      ...userData,
      email: userData.email?.toLowerCase().trim(),
    };
  }, []);

  /* =========================
     INIT AUTH (AU DEMARRAGE)
  ========================= */
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // On vérifie s'il y a un token avant de lancer la requête inutilement
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
          console.error("Échec de l'initialisation auto:", err.message);
          // On ne vide QUE si ce n'est pas une erreur de serveur (429, 500)
          if (err.response?.status === 401 || err.response?.status === 403) {
            setUser(null);
            localStorage.clear(); // Plus radical mais sûr
          }
        }
        logout();
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    initAuth();
    return () => { isMounted = false; };
  }, [formatUser]); // formatUser est stable grâce au useCallback


  /* =========================
     CSRF TOKEN
  ========================= */
  useEffect(() => {
    const fetchCSRF = async () => {
      try {
        const res = await api.get("/csrf-token");
        localStorage.setItem("csrfToken", res.data.csrfToken);
      } catch (err) {
        console.error("Erreur CSRF:", err);
      }
    };

    fetchCSRF();
  }, []);
  /* =========================
     LOGIN
  ========================= */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...credentials,
        email: credentials.email.toLowerCase().trim(),
      };

      const res = await api.post("/auth/login", payload);

      const { user, accessToken } = res.data;

      const formattedUser = formatUser(user);

      // 🔥 stockage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(formattedUser));

      setUser(formattedUser);

      return res.data;

    } catch (err) {
      const message =
        err.response?.data?.message || "Erreur de connexion";

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

      const payload = {
        ...data,
        email: data.email.toLowerCase().trim(),
      };

      const res = await api.post("/auth/register", payload);
      return res.data;

    } catch (err) {
      const message =
        err.response?.data?.message || "Erreur inscription";

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
      const message =
        err.response?.data?.message || "OTP invalide";

      setError(message);
      throw new Error(message);

    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LOGING WITH GOOGLE
  ========================= */
  /* =========================
      LOGIN WITH GOOGLE
  ========================= */
  const loginWithGoogle = async (googleAccessToken) => {
    try {
      setLoading(true);
      setError(null);
      const csrfToken = localStorage.getItem("csrfToken");
      
      // On utilise ton instance "api" au lieu de "axios" direct
      // On envoie le token reçu de Google au backend
      const res = await api.post(
        "/auth/google",
        { token: googleAccessToken },
        {
          headers: {
            "x-csrf-token": csrfToken,
          },
        }
      );

      const { user, accessToken } = res.data;
      const formattedUser = formatUser(user);

      // 🔥 On utilise "accessToken" pour rester cohérent avec ta fonction login()
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(formattedUser));

      setUser(formattedUser);
      
      // Pas besoin de navigate('/') ici si tu veux que le composant qui appelle 
      // la fonction gère la redirection (ex: vers checkout)
      return res.data;

    } catch (err) {
      const message = err.response?.data?.message || "Échec de la connexion Google";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };
    /* =========================
     LOGOUT
  ========================= */
  const logout = async () => {
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

  /* =========================
     LOADER GLOBAL
  ========================= */
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 rounded-full border-t-transparent" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        verifyOtp,
        loginWithGoogle,
        logout,
        updateUser,
        loading,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================
   HOOK
========================= */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }

  return context;
};