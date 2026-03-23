import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowRight, Loader2, AlertCircle, 
  Eye, EyeOff, ChevronLeft, Mail, Lock 
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, error: authError, setError: setAuthError, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  // Si l'utilisateur est déjà connecté, on le redirige immédiatement
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
    // Nettoyer les erreurs d'auth précédentes quand on arrive sur la page
    return () => setAuthError(null);
  }, [isAuthenticated, navigate, setAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLocalLoading(true);

    try {
      // Le trim() est crucial pour l'expérience mobile
      await login({ 
        email: email.toLowerCase().trim(), 
        password 
      });
      navigate("/");
    } catch (err) {
      // On affiche l'erreur du serveur ou un message générique
      setLocalError(err.message || "Impossible de se connecter.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* SECTION GAUCHE : Branding (Visible Desktop) */}
      <div className="hidden md:flex md:w-[40%] bg-black relative p-16 flex-col justify-between overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full" />
        
        <Link to="/" className="relative z-10 flex items-center gap-2 text-white/60 hover:text-white transition-all group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Retour boutique</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-[2.5vw] leading-[0.85] font-[1000] uppercase tracking-tighter text-white italic">
            Cheel<span className="text-indigo-500 not-italic">.</span><br />
            Espace<br />Client
          </h2>
          <p className="mt-8 text-white/40 text-[11px] font-bold uppercase tracking-[0.3em] max-w-xs leading-relaxed">
            Gérez et suivez vos commandes en un seul endroit. <br/>
            <span className="text-indigo-500">Votre partenaire digital.</span>
          </p>
        </div>

        <div className="relative z-10 text-white/20 text-[9px] font-black tracking-widest uppercase">
          © 2026 Cheel — Chad Digital Excellence
        </div>
      </div>

      {/* SECTION DROITE : Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[440px]">
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-[1000] uppercase tracking-tighter italic text-black mb-2">
              Connexion<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ravis de vous revoir parmi nous</p>
          </div>

          {/* Affichage des erreurs (locales ou globales) */}
          {(localError || authError) && (
            <div className="mb-8 flex items-center gap-4 bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl animate-in fade-in zoom-in duration-300">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                {localError || authError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Champ Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">
                Adresse Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 py-4 pl-12 pr-4 rounded-[1.2rem] text-sm font-bold placeholder:text-gray-300 focus:border-black focus:ring-0 outline-none transition-all shadow-sm group-hover:border-gray-200"
                  placeholder="nom@exemple.com"
                  required
                />
              </div>
            </div>

            {/* Champ Mot de Passe */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-black">
                  Mot de passe
                </label>
                <Link to="/forgot-password" className=" text-[10px] font-black uppercase text-indigo-600 hover:text-black transition-colors">
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-2 border-gray-100 py-4 pl-12 pr-12 rounded-[1.2rem] text-sm font-bold placeholder:text-gray-300 focus:border-black focus:ring-0 outline-none transition-all shadow-sm group-hover:border-gray-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Bouton de Soumission */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={localLoading}
                className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-black/10 hover:bg-indigo-600 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {localLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-black hover:text-indigo-600 border-b-2 border-black/10 hover:border-indigo-600 transition-all ml-1 pb-0.5">
                Créer un profil
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;