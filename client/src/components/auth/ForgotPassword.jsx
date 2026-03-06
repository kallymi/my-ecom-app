import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  ChevronLeft,
  CheckCircle2,
  Mail
} from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccess(data.message || "Lien de réinitialisation envoyé !");
      
      // On laisse l'utilisateur voir le succès avant de rediriger si nécessaire
      setTimeout(() => {
        if(data.success) navigate("/login");
      }, 5000);

    } catch (err) {
      setError(
        err.response?.data?.message || "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      
      {/* SECTION GAUCHE : Visuel & Branding */}
      <div className="hidden md:flex md:w-1/2 bg-black relative p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070')] bg-cover bg-center mix-blend-luminosity" />
        
        <Link to="/login" className="relative z-10 flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[12px] font-black uppercase tracking-[0.3em]">Retour au login</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-[3vw] leading-[0.8] font-[200] uppercase tracking-tighter text-white italic">
            Reset<span className="text-indigo-600">.</span><br />
            Access
          </h2>
          <p className="mt-6 text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] max-w-xs leading-loose">
            Entrez votre email pour recevoir une clé de récupération temporaire.
          </p>
        </div>

        <div className="relative z-10 text-white/20 text-[9px] font-medium tracking-widest uppercase">
          © 2026 Cheel Global Systems — Security Protocol
        </div>
      </div>

      {/* SECTION DROITE : Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-20 bg-[#F9F9F9]">
        <div className="w-full max-w-[400px]">
          
          {/* Header Mobile */}
          <div className="md:hidden mb-12">
            <h1 className="text-5xl font-[1000] uppercase tracking-tighter italic leading-none">
              Reset<span className="text-indigo-600">.</span>
            </h1>
          </div>

          <div className="mb-12 hidden md:block">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-black">Récupération</h3>
            <div className="h-[3px] w-12 bg-indigo-600 mt-2" />
          </div>

          {/* Messages d'état */}
          {error && (
            <div className="mb-8 flex items-center gap-3 bg-black text-white p-5 rounded-none animate-in fade-in slide-in-from-top-4 border-l-4 border-red-600">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-[9px] font-black uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-8 flex items-center gap-3 bg-indigo-600 text-white p-5 rounded-none animate-in zoom-in">
              <CheckCircle2 size={16} className="shrink-0" />
              <p className="text-[9px] font-black uppercase tracking-widest leading-tight">{success}</p>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="group border-b-2 border-black/5 focus-within:border-indigo-600 transition-colors pb-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-4">
                   VOTRE ADRESSE EMAIL
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="w-full bg-transparent border-none p-0 text-lg font-bold placeholder:text-gray-200 focus:ring-0 outline-none"
                    placeholder="nom@exemple.com"
                    required
                  />
                  <Mail size={18} className="text-gray-200 group-focus-within:text-indigo-600 transition-colors" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-black text-white py-6 overflow-hidden group disabled:bg-gray-100 transition-all"
              >
                <div className="relative z-10 flex items-center justify-center gap-4">
                  <span className="text-[11px] font-[1000] uppercase tracking-[0.4em]">
                    {loading ? "Traitement..." : "Envoyer le lien"}
                  </span>
                  {!loading && <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />}
                </div>
                <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-loose">
                Un protocole de récupération a été envoyé à <span className="text-black">{email}</span>. 
                Veuillez vérifier vos messages entrants (et spams).
              </p>
              <Link to="/login" className="inline-flex items-center gap-3 text-black font-black text-[11px] uppercase tracking-[0.3em] group">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Retour au login
              </Link>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-black/5">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
              Besoin d'aide supplémentaire ? <br />
              <a href="mailto:support@cheel.com" className="text-black hover:text-indigo-600 border-b border-black transition-colors">
                Contacter l'assistance
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;