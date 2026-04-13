import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  ShieldCheck, RefreshCcw, Loader2,
  AlertCircle, CheckCircle2, ArrowRight
} from "lucide-react";

const VerifyOtp = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { setUser } = useAuth();
  const email     = location.state?.email || "";

  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!email) {
      const timer = setTimeout(() => navigate("/register"), 3000);
      return () => clearTimeout(timer);
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      if (res.data.success) {
        setSuccess("Compte activé ! Redirection vers la connexion...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Code OTP incorrect ou expiré");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await api.post("/auth/resend-otp", { email });
      setSuccess(res.data.message || "Nouveau code envoyé !");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  // Session expirée
  if (!email) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-6">
        <div className="w-full max-w-[380px] bg-white rounded-3xl p-9 text-center shadow-[0_4px_6px_rgba(0,0,0,0.04),0_20px_40px_rgba(91,110,245,0.08)] border border-indigo-500/10">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="text-rose-500" size={26} />
          </div>
          <h2 className="text-xl font-bold text-black mb-2" style={{ fontFamily: "Georgia, serif" }}>
            Session expirée
          </h2>
          <p className="text-sm text-gray-400">
            Nous avons perdu la trace de votre email. <br />
            Redirection vers l'inscription...
          </p>
        </div>
      </div>
    );
  }

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

        {/* Icône + Titre */}
        <div className="flex items-center gap-4 mb-7">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.5px" }}>
              Vérification
            </h1>
            <p className="text-sm text-gray-400">
              Code envoyé à <span className="text-gray-700 font-semibold">{email}</span>
            </p>
          </div>
        </div>

        {/* Alertes */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 mb-5 animate-in fade-in zoom-in duration-200">
            <AlertCircle size={16} className="shrink-0" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl p-3 mb-5 animate-in fade-in zoom-in duration-200">
            <CheckCircle2 size={16} className="shrink-0" />
            <p className="text-xs font-semibold">{success}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
              Code OTP (6 chiffres)
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
              autoFocus
              className="w-full text-center bg-gray-50 border-[1.5px] border-gray-200 rounded-xl py-5 text-3xl font-bold text-gray-900 tracking-[0.5em] placeholder:text-gray-200 placeholder:text-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />

            {/* Indicateur progression */}
            <div className="flex gap-1.5 mt-2">
              {[1,2,3,4,5,6].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                    otp.length >= i ? "bg-indigo-500" : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Activer mon compte
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Renvoi */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
          <p className="text-xs text-gray-400">Vous n'avez rien reçu ?</p>
          <button
            onClick={handleResendOtp}
            disabled={loading}
            type="button"
            className="flex items-center gap-2 text-indigo-500 hover:text-indigo-700 font-semibold text-xs uppercase tracking-widest transition-all disabled:opacity-50 group"
          >
            <RefreshCcw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
            Renvoyer un code
          </button>
        </div>

        {/* Retour */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/login")}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Annuler et revenir
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;
