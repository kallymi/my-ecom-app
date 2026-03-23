import { useState } from "react";
import api from "../api/axios";

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetPassword = async ({ email, otp, password }) => {
    setLoading(true);
    setError("");

    try {
      // Sécurité : on s'assure que l'email est en minuscules et sans espaces
      const cleanEmail = email.trim().toLowerCase();

      await api.post("/auth/reset-password", {
        email: cleanEmail,
        otp: otp.trim(),
        password: password.trim(),
      });
      
      return true;
    } catch (err) {
      // Récupération du message d'erreur précis du backend
      const errorMessage = err.response?.data?.message || "Une erreur serveur est survenue.";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error };
};