import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const GoogleLoginButton = () => {
  const { loginWithGoogle, loading } = useAuth();

  const handleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Google renvoie un access_token que l'on envoie à notre backend
      await loginWithGoogle(tokenResponse.access_token);
    },
    onError: () => toast.error("La connexion Google a échoué"),
  });

  return (
    <button
      type="button"
      onClick={() => handleLogin()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
    >
      <img 
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
        alt="Google" 
        className="w-5 h-5" 
      />
      <span className="text-[11px] uppercase tracking-widest">
        {loading ? "Chargement..." : "Continuer avec Google"}
      </span>
    </button>
  );
};

export default GoogleLoginButton;