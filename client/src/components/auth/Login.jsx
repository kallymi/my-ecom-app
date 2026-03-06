import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ChevronLeft
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

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
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Accès refusé. Vérifiez vos clés.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      
      {/* SECTION GAUCHE : Visuel & Branding (Caché sur mobile ou réduit) */}
      <div className="hidden md:flex md:w-1/2 bg-black relative p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-40 bg- bg-cover bg-center mix-blend-luminosity" />
        
        <Link to="/" className="relative z-10 flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[12px] font-black uppercase tracking-[0.3em]">Retour a la boutique</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-[3vw] leading-[0.8] font-[200] uppercase tracking-tighter text-white italic">
            Cheel<span className="text-indigo-600">.</span><br />
            Boutique
          </h2>
          <p className="mt-6 text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] max-w-xs leading-loose">
            Accédez à votre espace curateur et gérez vos pépites technologiques.
          </p>
        </div>


        <div className="relative z-10 text-white/20 text-[9px] font-medium tracking-widest uppercase">
          © 2026 Cheel Global Systems — All Rights Reserved
        </div>
      </div>

      {/* SECTION DROITE : Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-20 bg-[#F9F9F9]">
        <div className="w-full max-w-[400px]">
          
          {/* Header Mobile Only */}
          <div className="md:hidden mb-12">
            <h1 className="text-5xl font-[1000] uppercase tracking-tighter italic leading-none">
              Login<span className="text-indigo-600">.</span>
            </h1>
          </div>

          <div className="mb-12 hidden md:block">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-black">Identification</h3>
            <div className="h-[3px] w-12 bg-indigo-600 mt-2" />
          </div>

          {error && (
            <div className="mb-8 flex items-center gap-3 bg-black text-white p-5 rounded-none animate-in fade-in slide-in-from-top-4">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-[9px] font-black uppercase tracking-widest leading-tight">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div className="group border-b-2 border-black/5 focus-within:border-indigo-600 transition-colors pb-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-4">
                 ADRESSE email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLocaleLowerCase())}
                className="w-full bg-transparent border-none p-0 text-lg font-bold placeholder:text-gray-200 focus:ring-0 outline-none"
                placeholder=""
                required
              />
            </div>

            {/* Password */}
            <div className="group border-b-2 border-black/5 focus-within:border-indigo-600 transition-colors pb-2">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
                   Mot de PASSE
                </label>
                <Link to="/forgot-password" size={14} className="text-[9px] font-black uppercase text-indigo-600 hover:text-black">
                  OuBLIER ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-lg font-bold placeholder:text-gray-200 focus:ring-0 outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-black text-white py-6 overflow-hidden group disabled:bg-gray-100 transition-all"
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                <span className="text-[11px] font-[1000] uppercase tracking-[0.4em]">
                  {loading ? "Authenticating..." : "SE CONNECTER"}
                </span>
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />}
              </div>
              
              {/* Effet de remplissage au hover */}
              <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-black/5">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
              New to the ecosystem? <br />
              <Link to="/register" className="text-black hover:text-indigo-600 border-b border-black transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;