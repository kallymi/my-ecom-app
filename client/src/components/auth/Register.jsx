import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight, Loader2, AlertCircle, CheckCircle2,
  Eye, EyeOff, User, Mail, Lock
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
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
      await register({
        name: formData.name.trim(),
        email: emailClean,
        password: formData.password,
      });

      setSuccess("Compte créé ! Redirection vers la vérification...");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email: emailClean } });
      }, 1500);
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Orbes de fond */}
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/[0.07] rounded-full blur-3xl pointer-events-none" />

      {/* Grille décorative */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(91,110,245,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,110,245,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Carte centrale */}
      <div className="relative z-10 w-full max-w-[460px] bg-white rounded-3xl p-9 my-8 shadow-[0_4px_6px_rgba(0,0,0,0.04),0_20px_40px_rgba(91,110,245,0.08)] border border-indigo-500/10">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <path d="M5 10 Q5 4 14 4 Q23 4 23 10" stroke="#5B6EF5" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="3" y="10" width="22" height="14" rx="3" fill="white"/>
              <circle cx="9" cy="26" r="2" fill="#5B6EF5"/>
              <circle cx="19" cy="26" r="2" fill="#5B6EF5"/>
              <text x="13" y="20" textAnchor="middle" fontFamily="Georgia,serif" fontSize="7" fontWeight="700" fill="#111">cheel</text>
              <path d="M7 22 Q13 25 19 22" stroke="#5B6EF5" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-black tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
            cheel<span className="text-indigo-500">.</span>
          </span>
        </div>

        {/* Titre */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-black mb-1" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.5px" }}>
            Créer un compte
          </h1>
          <p className="text-sm text-gray-400">
            Rejoignez l'écosystème Cheel dès aujourd'hui
          </p>
        </div>

        {/* Alertes */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 mb-5 animate-in fade-in zoom-in duration-200">
            <AlertCircle size={16} className="shrink-0" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl p-3 mb-5 animate-in fade-in zoom-in duration-200">
            <CheckCircle2 size={16} className="shrink-0" />
            <p className="text-xs font-semibold">{success}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nom */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
              Nom complet
            </label>
            <div className="relative group">
              <User
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Mahamat Idriss"
                required
                className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
              Adresse email
            </label>
            <div className="relative group">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nom@exemple.com"
                required
                className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
            </div>
          </div>

          {/* Mots de passe côte à côte */}
          <div className="grid grid-cols-2 gap-3">

            {/* Mot de passe */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 car."
                  required
                  className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl py-3.5 pl-10 pr-9 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-widest">
                Confirmation
              </label>
              <div className="relative group">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-tapez"
                  required
                  className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl py-3.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Indicateur force mot de passe */}
          {formData.password.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      formData.password.length >= lvl * 3
                        ? lvl <= 1 ? "bg-rose-400"
                          : lvl <= 2 ? "bg-amber-400"
                          : lvl <= 3 ? "bg-yellow-400"
                          : "bg-emerald-400"
                        : "bg-gray-100"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-gray-400">
                {formData.password.length < 4 ? "Trop court" :
                 formData.password.length < 7 ? "Faible" :
                 formData.password.length < 10 ? "Moyen" : "Fort ✓"}
              </p>
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3.5 rounded-xl text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Créer mon compte
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Lien connexion */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Déjà membre ?{" "}
            <Link to="/login" className="text-indigo-500 font-bold hover:text-indigo-700 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
