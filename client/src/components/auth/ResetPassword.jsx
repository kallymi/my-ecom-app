import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useResetPassword } from "../../hooks/useResetPassword";
import { validateReset } from "../../utils/validators";

import {
  KeyRound, ShieldCheck, Loader2, AlertCircle,
  Eye, EyeOff, Sparkles, ArrowLeft
} from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { resetPassword, loading, error: apiError } = useResetPassword();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Vérification de la session au montage
  const email = sessionStorage.getItem("resetEmail");

  useEffect(() => {
    if (!email) {
      setError("Session expirée ou invalide. Redirection...");
      const timer = setTimeout(() => navigate("/forgot-password"), 3000);
      return () => clearTimeout(timer);
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateReset({
      otp,
      password,
      confirmPassword,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!email) return;

    const success = await resetPassword({
      email,
      otp: otp.trim(),
      password: password.trim(),
    });

    if (success) {
      sessionStorage.removeItem("resetEmail");
      // On peut ajouter un petit délai ou un message de succès global ici
      navigate("/login", { state: { message: "Mot de passe mis à jour avec succès !" } });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background Orbs - Teintes Ambre pour le "Nouveau Départ" */}
      <div className="absolute top-[-10%] right-[-5%] w-[60%] sm:w-[45%] h-[45%] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[60%] sm:w-[45%] h-[45%] bg-indigo-50/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md sm:max-w-lg relative z-10">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="relative inline-flex mb-5 sm:mb-6 group">
            <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-amber-500 rounded-[1.5rem] sm:rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-amber-200/50">
              <KeyRound className="text-white" size={24} />
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-[1000] italic uppercase leading-tight tracking-tighter text-black">
            Nouveau <br />
            <span className="text-amber-500">Départ.</span>
          </h1>

          <p className="mt-4 text-gray-400 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em]">
            Protocole de sécurité activé pour <br/>
            <span className="text-black lowercase font-bold tracking-normal">{email || "session@invalide"}</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white/50">

          {/* Erreurs */}
          {(error || apiError) && (
            <div className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                {error || apiError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

            {/* OTP Section */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-3">
                Code de vérification (OTP)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full px-6 py-4 sm:py-5 mt-2 text-center text-2xl tracking-[0.5em] font-black bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-amber-200 outline-none transition-all shadow-inner"
                required
              />
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <div className="relative">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-3">
                  Nouveau mot de passe
                </label>
                <div className="relative mt-2 group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-300 group-focus-within:text-amber-500 transition-colors">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 sm:py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-amber-200 outline-none text-sm font-bold transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-gray-300 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirmation Section */}
              <div className="relative">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-3">
                  Confirmer le mot de passe
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-6 py-4 sm:py-5 mt-2 rounded-[1.5rem] border-2 outline-none text-sm font-bold transition-all
                    ${
                      confirmPassword && password !== confirmPassword
                        ? "bg-rose-50 border-rose-200 text-rose-500"
                        : confirmPassword && password === confirmPassword
                        ? "bg-emerald-50 border-emerald-100 focus:border-emerald-200"
                        : "bg-slate-50 border-transparent focus:bg-white focus:border-amber-200"
                    }`}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-black text-white py-5 rounded-[1.8rem] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-amber-500 shadow-xl shadow-black/10 hover:shadow-amber-500/30 transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Réinitialiser l'accès <Sparkles size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Navigation Footer */}
        <div className="text-center mt-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-black text-[10px] font-black uppercase tracking-[0.2em] transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Retour à l'accès membre
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;