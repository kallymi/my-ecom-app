import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Sparkles 
} from "lucide-react";

const ResetPassword = ({ email }) => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) return setError("Veuillez entrer le code OTP reçu par email");
    if (password.length < 6) return setError("Mot de passe trop court (min. 6)");
    if (password !== confirmPassword) return setError("Les mots de passe ne correspondent pas");

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        otp,
        password
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "OTP invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Orbs (Amber Vibe) */}
      <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] bg-orange-50/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[460px] relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="relative inline-flex mb-6 group">
            <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-16 h-16 bg-amber-500 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-amber-200/50 transition-transform group-hover:rotate-12">
              <KeyRound className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-[1000] tracking-tighter italic text-black uppercase leading-[0.9]">
            Nouveau <br /> <span className="text-amber-500">Départ.</span>
          </h1>
          <p className="mt-4 text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">
            Sécurisez à nouveau votre compte
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white/50">
          
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* OTP Code */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Code OTP (Email)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="block w-full px-8 py-5 bg-gray-50/50 border-2 border-transparent rounded-[2.2rem] text-center text-xl tracking-[0.5em] font-black placeholder:text-gray-200 focus:bg-white focus:border-amber-100 focus:outline-none transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Nouveau Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <ShieldCheck size={18} className="text-gray-300 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 pr-14 py-5 bg-gray-50/50 border-2 border-transparent rounded-[2.2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-amber-100 focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-300 hover:text-amber-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Confirmation</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`block w-full px-8 py-5 border-2 rounded-[2.2rem] text-sm font-bold transition-all focus:outline-none
                  ${confirmPassword && password !== confirmPassword 
                    ? "bg-red-50 border-red-100 text-red-500" 
                    : "bg-gray-50/50 border-transparent focus:bg-white focus:border-amber-100"
                  }`}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-black text-white py-5 rounded-[2.2rem] font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-black/10 hover:bg-amber-500 hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-100"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>Mettre à jour <Sparkles size={16} /></>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <Link to="/login" className="text-gray-400 hover:text-black transition-colors text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-black pb-1">
            Se connecter plutôt
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;