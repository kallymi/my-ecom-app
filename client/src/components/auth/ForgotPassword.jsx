import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  Mail, 
  HelpCircle, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  Sparkles 
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
      
      // On laisse le temps à l'utilisateur de lire le message de succès
      setTimeout(() => {
        navigate("/reset-password", { state: { email }});
      }, 3000);

    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible d'envoyer l'email pour le moment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Chill Background Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[460px] relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="relative inline-flex mb-6 group">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-16 h-16 bg-white border border-blue-50 rounded-[1.8rem] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
              <HelpCircle className="text-blue-600" size={28} />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-[500] tracking-tighter italic text-black uppercase leading-[0.9]">
            Oubli de <br /> <span className="text-blue-600">Passe.</span>
          </h1>
          <p className="mt-4 text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] max-w-[280px] mx-auto leading-relaxed">
            Pas de panique, on s'occupe de tout.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white/50 overflow-hidden">
          
          {/* Status Messages */}
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-600 animate-in fade-in zoom-in">
              <CheckCircle2 size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{success}</p>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 ml-4">
                  Votre Adresse Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-14 pr-6 py-5 bg-gray-50/50 border-2 border-transparent rounded-[2.2rem] text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-100 focus:outline-none transition-all"
                    placeholder="nom@exemple.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full bg-black text-white py-5 rounded-[2.2rem] font-black uppercase text-[11px] tracking-[0.25em] shadow-xl shadow-black/10 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>Envoyer le lien <Sparkles size={16} /></>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <p className="text-xs text-gray-500 font-bold leading-relaxed px-4">
                Vérifiez votre boîte de réception. Un lien de réinitialisation vous a été envoyé. Pensez à regarder vos spams !
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-black font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-black/10 hover:border-blue-600 hover:text-blue-600 transition-all pb-1"
                >
                  <ArrowLeft size={14} /> Retour au Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Link */}
        {!success && (
          <div className="text-center mt-10">
            <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-[10px] font-black uppercase tracking-[0.2em]">
              <ArrowLeft size={14} /> Revenir en arrière
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;