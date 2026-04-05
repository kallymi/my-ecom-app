import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Lock, 
  Mail, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ChevronLeft,
  ArrowRight,
  ShieldCheck 
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../auth/AuthContext";
import { useEffect } from "react";


export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();



  // Redire automatiquement si deja connecte 
  useEffect(() => {
    if (!loading && user && user.role === "admin") {
        navigate("/admin", { replace: true });
    }
  }, [user, loading, navigate]);

  // si on est en train de charger l'auth, on affiche rien ou un loader
  if(loading) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/auth/login", { email, password });

      // 1. On extrait l'accessToken renvoyé par sendAuthResponse
      const { user, accessToken } = res.data; 

      if (!user || user.role !== "admin") {
        setError("ACCÈS REFUSÉ : PRIVILÈGES INSUFFISANTS");
        setLoading(false);
        return;
      }

      // 2. STOCKAGE CRUCIAL : On enregistre le token pour Axios
      if (accessToken) {
        localStorage.setItem("adminToken", accessToken);
      }

      // 3. Mise à jour du contexte et redirection
      login(user);
      navigate("/admin", { replace: true });

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.response?.data?.message || "IDENTIFIANTS INCORRECTS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* SECTION GAUCHE : Branding Admin (Noir) */}
      <div className="hidden md:flex md:w-1/2 bg-black relative p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070')] bg-cover bg-center mix-blend-luminosity" />
        
        <Link to="/" className="relative z-10 flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[12px] font-black uppercase tracking-[0.3em]">Quitter le terminal</span>
        </Link>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 text-indigo-500">
            <ShieldCheck size={40} strokeWidth={1} />
          </div>
          <h2 className="text-[4vw] leading-[0.8] font-[200] uppercase tracking-tighter text-white italic">
            Admin<span className="text-indigo-600">.</span><br />
            Terminal
          </h2>
          <p className="mt-6 text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] max-w-xs leading-loose">
            Accès sécurisé au cœur du système Cheel Global. Authentification requise.
          </p>
        </div>

        <div className="relative z-10 text-white/20 text-[9px] font-medium tracking-widest uppercase">
          © 2026 Cheel Global Systems — Level A Security
        </div>
      </div>

      {/* SECTION DROITE : Formulaire Admin */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-20 bg-[#F9F9F9]">
        <div className="w-full max-w-[400px]">
          
          {/* Header Mobile */}
          <div className="md:hidden mb-12">
            <h1 className="text-4xl font-[400] uppercase tracking-tighter italic leading-none">
              Admin Cheel<span className="text-indigo-600">.</span>
            </h1>
          </div>

          <div className="mb-12 hidden md:block">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-black italic">System Login</h3>
            <div className="h-[3px] w-12 bg-indigo-600 mt-2" />
          </div>

          {error && (
            <div className="mb-8 flex items-center gap-3 bg-black text-white p-5 rounded-none animate-in fade-in slide-in-from-top-4 border-l-4 border-red-600">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-[9px] font-black uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Email */}
            <div className="group border-b-2 border-black/5 focus-within:border-indigo-600 transition-colors pb-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-4">
                 Identifiant Admin
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="email"
                  value={email}
                  // L'email est forcé en minuscules ici
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  className="w-full bg-transparent border-none p-0 text-lg font-bold placeholder:text-gray-200 focus:ring-0 outline-none"
                  placeholder=""
                  required
                />
                <Mail size={18} className="text-gray-200 group-focus-within:text-indigo-600" />
              </div>
            </div>

            {/* Password */}
            <div className="group border-b-2 border-black/5 focus-within:border-indigo-600 transition-colors pb-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-4">
                 Code d'Accès
              </label>
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
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition-colors"
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
                  {loading ? "Chargement..." : "Entrer dans le Dashboard"}
                </span>
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />}
              </div>
              <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </form>

          

          <div className="mt-12 pt-8 border-t border-black/5">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed italic">
              Terminal sécurisé. Toutes les connexions sont surveillées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}