import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Chill Background Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[480px] relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-6 group">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-16 h-16 bg-blue-600 rounded-[1.8rem] flex items-center justify-center shadow-2xl transition-transform group-hover:-rotate-6">
              <User className="text-white" size={28} />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-[500] tracking-tighter italic text-black uppercase leading-none">
            Rejoindre l' <br /> <span className="text-blue-600">Equipe Chell.</span>
          </h1>
          <p className="mt-4 text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">
            Créez votre profil en 2 minutes
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white/50">
          
          {/* Status Messages */}
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-600 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Nom Complet</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-14 pr-6 py-4.5 bg-gray-50/50 border-2 border-transparent rounded-[2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-100 focus:outline-none transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Adresse Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-14 pr-6 py-4.5 bg-gray-50/50 border-2 border-transparent rounded-[2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-100 focus:outline-none transition-all"
                  placeholder="john@exemple.com"
                  required
                />
              </div>
            </div>

            {/* Password Grid (Responsive) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Password</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-6 py-4.5 bg-gray-50/50 border-2 border-transparent rounded-[2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-100 focus:outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-300 hover:text-blue-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Confirm</label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full px-6 py-4.5 bg-gray-50/50 border-2 border-transparent rounded-[2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-100 focus:outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-300 hover:text-blue-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-black text-white py-5 rounded-[2.2rem] font-black uppercase text-[11px] tracking-[0.25em] shadow-2xl shadow-black/10 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Commencer l'aventure <ArrowRight size={18} /></>}
              </button>
            </div>
          </form>

          {/* Social Alternative */}
          {/* <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <span className="relative bg-white px-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">Ou via Google</span>
          </div> */}

          {/* <button className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-gray-100 rounded-[2rem] hover:bg-gray-50 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">S'inscrire avec Google</span>
          </button> */}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            Déjà des nôtres ? <Link to="/login" className="text-black hover:text-blue-600 transition-colors border-b-2 border-black/10 hover:border-blue-600 ml-1">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;