import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles 
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email: cleanEmail, password: cleanPassword },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Éléments de design en arrière-plan (Chill Vibes) */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]" />

      <div className="w-full max-w-[440px] relative z-10">
        
        {/* Header - Plus moderne */}
        <div className="text-center mb-10">
          {/* <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
            <div className="relative w-16 h-16 bg-black rounded-[1.8rem] flex items-center justify-center shadow-2xl rotate-3">
              <Sparkles className="text-blue-400" size={28} />
            </div>
          </div> */}
          <h1 className="text-2xl font-[500] tracking-tighter italic text-black uppercase leading-none">
            Welcome Back  <br /> <span className="text-blue-600">Cheel.</span>
          </h1>
          <p className="mt-4 text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">
            Identifiez-vous pour continuer
          </p>
        </div>

        {/* Formulaire Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white">
          
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 ml-4">
                Email Universel
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  inputMode="email"
                  className="block w-full pl-14 pr-6 py-5 bg-gray-50/50 border-2 border-transparent rounded-[2.2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">
                  Clé d'accès
                </label>
                <Link to="/forgot-password" size={18} className="text-[9px] font-black text-blue-600 uppercase hover:text-black transition-colors">
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoCapitalize="none"
                  autoCorrect="off"
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 pr-14 py-5 bg-gray-50/50 border-2 border-transparent rounded-[2.2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-300 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-black text-white py-5 rounded-[2.2rem] font-black uppercase text-[11px] tracking-[0.25em] shadow-2xl shadow-black/10 hover:bg-blue-600 hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:shadow-none"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Entrer dans l'espace <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Link */}
        <div className="text-center mt-10">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-black hover:text-blue-600 transition-colors border-b-2 border-black/10 hover:border-blue-600">
              Rejoindre la communauté
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;