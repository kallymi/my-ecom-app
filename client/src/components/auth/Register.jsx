import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronLeft
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccess(data.message || "Compte créé ! Redirection...");
      setTimeout(() => {
        navigate("/verify-otp", { state: { email: formData.email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      
      {/* SECTION GAUCHE : Branding & Image */}
      <div className="hidden md:flex md:w-5/12 bg-black relative p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-50 bg- bg-cover bg-center mix-blend-luminosity" />
        
        <Link to="/login" className="relative z-10 flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Login</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-[3vw] leading-[0.8] font-[500] uppercase tracking-tighter text-white italic">
            REJOINDRE<span className="text-indigo-600">.</span><br />
            Cheel
          </h2>
          <p className="mt-8 text-white/40 text-[9px] font-bold uppercase tracking-[0.4em] max-w-xs leading-loose">
            Devenez membre de l'écosystème et accédez aux drops exclusifs.
          </p>
        </div>

        <div className="relative z-10 text-white/10 text-[9px] font-medium tracking-[0.5em] uppercase">
          Ecosystem Access — 2026
        </div>
      </div>

      {/* SECTION DROITE : Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-20 bg-[#F9F9F9] overflow-y-auto">
        <div className="w-full max-w-[440px] py-10">
          
          <div className="mb-12">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-black">Inscription</h3>
            <div className="h-[3px] w-12 bg-indigo-600 mt-2" />
          </div>

          {/* Messages d'état */}
          {error && (
            <div className="mb-8 flex items-center gap-3 bg-black text-white p-5 animate-in fade-in slide-in-from-top-4">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-[9px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-8 flex items-center gap-3 bg-indigo-600 text-white p-5 animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 size={16} className="shrink-0" />
              <p className="text-[9px] font-black uppercase tracking-widest">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Nom Complet */}
            <div className="group border-b-2 border-black/5 focus-within:border-indigo-600 transition-colors pb-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-3">
                NOM COMPLET
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent border-none p-0 text-lg font-bold placeholder:text-gray-200 focus:ring-0 outline-none"
                placeholder=""
                required
              />
            </div>

            {/* Email */}
            <div className="group border-b-2 border-black/5 focus-within:border-indigo-600 transition-colors pb-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-3">
                ADRESSE EMAIL
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent border-none p-0 text-lg font-bold placeholder:text-gray-200 focus:ring-0 outline-none"
                placeholder=""
                required
              />
            </div>

            {/* Grille Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group border-b-2 border-black/5 focus-within:border-indigo-600 transition-colors pb-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-3">
                  MOT DE PASSE
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none p-0 text-lg font-bold placeholder:text-gray-200 focus:ring-0 outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="group border-b-2 border-black/5 focus-within:border-indigo-600 transition-colors pb-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-3">
                   CONFIRMER LE MOT DE PASSE
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none p-0 text-lg font-bold placeholder:text-gray-200 focus:ring-0 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full bg-black text-white py-6 overflow-hidden group disabled:bg-gray-100 transition-all"
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                <span className="text-[11px] font-[1000] uppercase tracking-[0.4em]">
                  {loading ? "Creating Profile..." : "REJOINDRE L'Adventure"}
                </span>
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />}
              </div>
              <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-black/5">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              DEJA member? <br />
              <Link to="/login" className="text-black hover:text-indigo-600 border-b border-black transition-colors">
                CONNECTEZ VOUS
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;