import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, RefreshCcw, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

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

      setSuccess("Compte vérifié avec succès");
      setTimeout(() => navigate("/"), 1200);

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
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 text-center max-w-md">
          <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
          <p className="font-black uppercase tracking-widest text-xs text-gray-400 mb-6">Email manquant</p>
          <button 
            onClick={() => navigate("/register")}
            className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all"
          >
            Retour à l'inscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px]">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-[2rem] mb-6 shadow-xl shadow-emerald-100">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <h1 className="text-4xl font-[900] tracking-tighter italic text-black uppercase mb-2">
            Vérifier le <span className="text-emerald-500">Compte.</span>
          </h1>
          <p className="text-gray-400 font-medium text-sm leading-relaxed max-w-[280px] mx-auto">
            Nous avons envoyé un code de sécurité à : <br/>
            <span className="text-black font-black lowercase">{email}</span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
          
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 animate-in fade-in zoom-in">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-600 animate-in fade-in zoom-in">
              <CheckCircle2 size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3 text-center">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                Code de vérification
              </label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full text-center py-6 bg-gray-50 border-2 border-transparent rounded-[2rem] text-3xl font-black tracking-[0.5em] focus:bg-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-gray-200"
                placeholder="000000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-black/20 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Confirmer <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Resend Action */}
          <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col items-center">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Rien reçu ?</p>
            <button 
              onClick={handleResendOtp}
              disabled={loading}
              className="flex items-center gap-2 text-black hover:text-emerald-500 font-black text-xs uppercase tracking-widest transition-colors group"
            >
              <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              Renvoyer un nouveau code
            </button>
          </div>
        </div>

        <div className="text-center mt-10">
          <button onClick={() => navigate("/login")} className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-black transition-colors">
            Annuler et revenir
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;