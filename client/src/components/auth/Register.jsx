import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight, Loader2, AlertCircle, CheckCircle2,
  Eye, EyeOff, ChevronLeft, User, Mail, Lock
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Efface l'erreur quand l'utilisateur corrige
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // --- VALIDATIONS FRONTEND ---
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      const emailClean = formData.email.toLowerCase().trim();
      
      const response = await register({
        name: formData.name.trim(),
        email: emailClean,
        password: formData.password,
      });

      setSuccess("Compte créé avec succès ! Préparation de la vérification...");
      
      // On attend un peu pour que l'utilisateur lise le message de succès
      setTimeout(() => {
        // On transmet l'email à la page suivante pour faciliter l'UX
        navigate("/verify-otp", { state: { email: emailClean } });
      }, 1500);

    } catch (err) {
      // On récupère le message exact du backend (ex: "Cet email est déjà utilisé")
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* SECTION GAUCHE : Branding */}
      <div className="hidden md:flex md:w-[40%] bg-black relative p-16 flex-col justify-between overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full" />
        
        <Link to="/login" className="relative z-10 flex items-center gap-2 text-white/60 hover:text-white transition-all group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Retour connexion</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-[2.5vw] leading-[0.85] font-[1000] uppercase tracking-tighter text-white italic">
            REJOINDRE<span className="text-indigo-500 not-italic">.</span><br />
            L'UNIVERS<br />CHEEL
          </h2>
          <p className="mt-8 text-white/40 text-[11px] font-bold uppercase tracking-[0.3em] max-w-xs leading-relaxed">
            Créez votre profil et accédez à une expérience technologique unique au Tchad.
          </p>
        </div>

        <div className="relative z-10 text-white/20 text-[9px] font-black tracking-widest uppercase">
          Ecosystem Access — © 2026
        </div>
      </div>

      {/* SECTION DROITE : Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto bg-[#F9F9F9]">
        <div className="w-full max-w-[480px] py-10">
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-[1000] uppercase tracking-tighter italic text-black mb-2">
              Inscription<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Devenez membre de l'écosystème</p>
          </div>

          {/* Affichage des Alertes */}
          {error && (
            <div className="mb-6 flex items-center gap-4 bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-4 bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 size={20} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">Nom Complet</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white border-2 border-gray-100 py-4 pl-12 pr-4 rounded-[1.2rem] text-sm font-bold focus:border-black outline-none transition-all shadow-sm"
                  placeholder="Ex: Mahamat Cheel"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">Adresse Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border-2 border-gray-100 py-4 pl-12 pr-4 rounded-[1.2rem] text-sm font-bold focus:border-black outline-none transition-all shadow-sm"
                  placeholder="nom@exemple.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">Mot de passe</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={17} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-gray-100 py-4 pl-11 pr-11 rounded-[1.2rem] text-sm font-bold focus:border-black outline-none transition-all shadow-sm"
                    placeholder="Min. 6 car."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">Confirmation</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={17} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-gray-100 py-4 pl-11 pr-4 rounded-[1.2rem] text-sm font-bold focus:border-black outline-none transition-all shadow-sm"
                    placeholder="Re-tapez"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-black/10 hover:bg-indigo-600 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center border-t border-black/5 pt-8">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Déjà membre de l'écosystème ?{" "}
              <Link to="/login" className="text-black hover:text-indigo-600 border-b-2 border-black/10 hover:border-indigo-600 transition-all ml-1 pb-0.5">
                Se connecter
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;