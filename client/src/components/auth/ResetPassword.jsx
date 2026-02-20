import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { KeyRound, ShieldCheck, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

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
    if (password.length < 6) return setError("Mot de passe trop court");
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
  }



  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px]">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-[2rem] mb-6 shadow-xl shadow-amber-100">
            <KeyRound className="text-white" size={28} />
          </div>
          <h1 className="text-4xl font-[900] tracking-tighter italic text-black uppercase mb-2">
            Nouveau <span className="text-amber-500">Départ.</span>
          </h1>
          <p className="text-gray-400 font-medium text-sm uppercase tracking-widest">
            Sécurisez à nouveau votre compte
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
          
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* OTP */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">
                Code OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Entrez le code reçu par email"
                className="block w-full pl-5 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-black focus:outline-none transition-all"
                required
              />
            </div>

            {/* Nouveau Mot de Passe */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">
                Nouveau Mot de Passe
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <ShieldCheck size={18} className="text-gray-300 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-black focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-300 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmation Mot de Passe */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">
                Confirmer le mot de passe
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`block w-full pl-5 py-5 border-2 rounded-[2rem] text-sm font-bold transition-all focus:outline-none
                  ${confirmPassword && password !== confirmPassword 
                    ? "bg-rose-50 border-rose-200 text-rose-600" 
                    : "bg-gray-50 border-transparent focus:bg-white focus:border-black"
                  }`}
                required
              />
            </div>

            {/* Bouton Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-black/20 hover:bg-amber-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Mettre à jour <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <Link to="/login" className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-black transition-colors">
            Retourner à la page de connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
