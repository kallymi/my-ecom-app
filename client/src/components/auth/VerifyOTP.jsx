import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ShieldCheck, 
  RefreshCcw, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Sparkles 
} from "lucide-react";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { email, otp },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Compte vérifié !");
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
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/resend-otp",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccess(data.message || "Nouveau code envoyé");
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
          <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-[1000] italic uppercase tracking-tighter mb-2">Oups !</h2>
          <p className="font-bold text-[10px] uppercase tracking-widest text-gray-400 mb-8 px-4">Email manquant. Relancez l'inscription.</p>
          <button 
            onClick={() => navigate("/register")}
            className="w-full bg-black text-white py-5 rounded-[2.2rem] font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-black/10"
          >
            Retourner à l'inscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-teal-100/30 rounded-full blur-[120px] pointer-events-none" />

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
          <p className="mt-4 text-gray-400 font-bold text-[9px] uppercase tracking-[0.25em] leading-relaxed max-w-[300px] mx-auto">
            Code envoyé sur <span className="text-black">{email}</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white/50">
          
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 animate-in fade-in slide-in-from-top-2">
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
                Code de sécurité
              </label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full text-center py-6 bg-gray-50/50 border-2 border-transparent rounded-[2.2rem] text-4xl font-black tracking-[0.4em] focus:bg-white focus:border-emerald-100 focus:outline-none transition-all placeholder:text-gray-200"
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-black text-white py-5 rounded-[2.2rem] font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-black/10 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-100"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Vérifier maintenant <Sparkles size={16} /></>}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-10 pt-8 border-t border-gray-100/50 flex flex-col items-center">
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-4">Rien reçu ?</p>
            <button 
              onClick={handleResendOtp}
              disabled={loading}
              className="flex items-center gap-2 text-black hover:text-emerald-500 font-black text-[10px] uppercase tracking-widest transition-all group"
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
            className="text-gray-400 hover:text-black transition-colors text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-black/10 pb-1"
          >
            Annuler et revenir
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;