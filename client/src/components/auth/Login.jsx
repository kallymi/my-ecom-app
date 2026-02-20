import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <div className="w-full max-w-[450px]">
        
        {/* Header du formulaire */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-[2rem] mb-6 shadow-xl shadow-black/10">
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-4xl font-[900] tracking-tighter italic text-black uppercase mb-2">
            Bon de <span className="text-blue-600">Retour.</span>
          </h1>
          <p className="text-gray-400 font-medium text-sm uppercase tracking-widest">
            Accédez à votre espace client
          </p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
          
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 animate-in fade-in zoom-in">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">
                Adresse Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-5 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-black focus:outline-none transition-all"
                  placeholder="nom@exemple.com"
                  required
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Mot de passe
                </label>
                <Link to="/forgot-password" size={18} className="text-[9px] font-black text-blue-600 uppercase hover:underline">
                  Oublié ?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-5 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-black focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            {/* Bouton Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-black/20 hover:bg-blue-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Connexion <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            Nouveau ici ?{" "}
            <Link to="/register" className="text-black border-b-2 border-black pb-1 hover:text-blue-600 hover:border-blue-600 transition-colors">
              Créer un compte gratuit
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;