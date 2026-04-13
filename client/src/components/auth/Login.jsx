import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight, Loader2, AlertCircle,
  Eye, EyeOff, Mail, Lock
} from "lucide-react";
import GoogleLoginButton from "./GoogleLoginButton";

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError, setError: setAuthError, isAuthenticated } = useAuth();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError]     = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/");
    return () => setAuthError(null);
  }, [isAuthenticated, navigate, setAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLocalLoading(true);
    try {
      await login({ email: email.toLowerCase().trim(), password });
      navigate("/");
    } catch (err) {
      setLocalError(err.message || "Impossible de se connecter.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Orbes de fond */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/[0.07] rounded-full blur-3xl pointer-events-none" />

      {/* Grille décorative */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(91,110,245,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,110,245,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Carte centrale */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-3xl p-9 shadow-[0_4px_6px_rgba(0,0,0,0.04),0_20px_40px_rgba(91,110,245,0.08)] border border-indigo-500/10">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <path d="M5 10 Q5 4 14 4 Q23 4 23 10" stroke="#5B6EF5" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="3" y="10" width="22" height="14" rx="3" fill="white"/>
              <circle cx="9" cy="26" r="2" fill="#5B6EF5"/>
              <circle cx="19" cy="26" r="2" fill="#5B6EF5"/>
              <text x="13" y="20" textAnchor="middle" fontFamily="Georgia,serif" fontSize="7" fontWeight="700" fill="#111">cheel</text>
              <path d="M7 22 Q13 25 19 22" stroke="#5B6EF5" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-black tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
            cheel<span className="text-indigo-500">.</span>
          </span>
        </div>

        {/* Titre */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-black mb-1" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.5px" }}>
            Bon retour
          </h1>
          <p className="text-sm text-gray-400">
            Connectez-vous à votre espace client
          </p>
        </div>

        {/* Erreur */}
        {(localError || authError) && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 mb-5 animate-in fade-in zoom-in duration-200">
            <AlertCircle size={16} className="shrink-0" />
            <p className="text-xs font-semibold">{localError || authError}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
              Adresse email
            </label>
            <div className="relative group">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                required
                className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
                Mot de passe
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative group">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl py-3.5 pl-11 pr-12 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={localLoading}
            className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all"
          >
            {localLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Se connecter
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Séparateur */}
        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px bg-gray-100" />
          <span className="text-[11px] text-gray-400 uppercase tracking-widest">ou</span>
          <span className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Google */}
        <GoogleLoginButton />

        {/* Inscription */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-indigo-500 font-bold hover:text-indigo-700 transition-colors">
            Créer un profil
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
