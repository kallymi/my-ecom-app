import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios"; // Utilise ton instance configurée
import { useAuth } from "../../context/AuthContext";
import { 
  ShieldCheck, RefreshCcw, Loader2, 
  AlertCircle, CheckCircle2, Sparkles 
} from "lucide-react";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirection si l'email est perdu (rafraîchissement de page par ex)
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
      // On utilise l'instance 'api' pour profiter de la config BaseURL
      const res = await api.post("/auth/verify-otp", { email, otp });
      
      const userData = res.data.user;

      // Mise à jour du contexte global
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      setSuccess("Compte vérifié avec succès !");
      
      // Redirection vers l'accueil
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Code OTP invalide ou expiré");
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
      setError(err.response?.data?.message || "Erreur lors de l’envoi");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-2xl border border-white text-center max-w-md animate-in fade-in zoom-in">
          <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-rose-500" size={40} />
          </div>
          <h2 className="text-2xl font-[1000] italic uppercase tracking-tighter mb-2 text-black">Session expirée</h2>
          <p className="font-bold text-[10px] uppercase tracking-widest text-gray-400 mb-8 px-4 leading-relaxed">
            Nous avons perdu la trace de votre email. <br/> Redirection vers l'inscription...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-100/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[460px] relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-6 group">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-16 h-16 bg-emerald-500 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-emerald-200/50">
              <ShieldCheck className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-[1000] tracking-tighter italic text-black uppercase leading-[0.9]">
            Vérifier le <br /> <span className="text-emerald-500">Compte.</span>
          </h1>
          <p className="mt-4 text-gray-400 font-bold text-[9px] uppercase tracking-[0.25em] leading-relaxed max-w-[320px] mx-auto">
            Entrez le code de sécurité envoyé à <br/>
            <span className="text-black lowercase font-black tracking-normal">{email}</span>
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white/50">
          
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-600 animate-in fade-in zoom-in">
              <CheckCircle2 size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3 text-center">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
                Code OTP (6 chiffres)
              </label>
              <input
                type="text"
                inputMode="numeric" // Force le pavé numérique sur mobile
                pattern="[0-9]*"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Autorise seulement les chiffres
                className="block w-full text-center py-6 bg-slate-50 border-2 border-transparent rounded-[2.2rem] text-4xl font-black tracking-[0.4em] focus:bg-white focus:border-emerald-200 focus:outline-none transition-all placeholder:text-slate-200 text-black shadow-inner"
                placeholder="000000"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="group w-full bg-black text-white py-5 rounded-[2.2rem] font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-black/10 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:shadow-none"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Activer mon accès <Sparkles size={16} /></>}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col items-center">
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-4">Rien reçu ?</p>
            <button 
              onClick={handleResendOtp}
              disabled={loading}
              type="button"
              className="flex items-center gap-2 text-black hover:text-emerald-500 font-black text-[10px] uppercase tracking-widest transition-all group disabled:opacity-50"
            >
              <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
              Renvoyer un code
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <button 
            onClick={() => navigate("/login")} 
            className="text-slate-400 hover:text-black transition-colors text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-black/10 pb-1"
          >
            Annuler et revenir
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;