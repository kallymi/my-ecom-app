import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import axios from "axios";
import { Link } from "react-router-dom";

import { Mail, HelpCircle, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

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

      setSuccess(data.message || "Un lien de réinitialisation a été envoyé.");
    
      setTimeout(() => {
        navigate("/reset-password", { state: { email }});
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible d'envoyer l'email pour le moment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px]">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-[2rem] mb-6 shadow-sm border border-blue-100">
            <HelpCircle className="text-blue-600" size={28} />
          </div>
          <h1 className="text-4xl font-[900] tracking-tighter italic text-black uppercase mb-2">
            Oubli de <span className="text-blue-600">Passe.</span>
          </h1>
          <p className="text-gray-400 font-medium text-sm leading-relaxed max-w-[280px] mx-auto uppercase tracking-tighter">
            Pas de panique, nous allons vous renvoyer un accès.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
          
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 animate-in fade-in zoom-in">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-600 animate-in fade-in zoom-in">
              <CheckCircle2 size={18} className="shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest">{success}</p>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">
                  Votre Adresse Email
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
                    placeholder="exemple@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-black/20 hover:bg-blue-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Recevoir le lien"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <p className="text-sm text-gray-500 font-medium">
                Vérifiez votre boîte de réception (et vos spams). Un lien de réinitialisation vous attend.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-black font-black text-xs uppercase tracking-widest border-b-2 border-black pb-1 hover:text-blue-600 hover:border-blue-600 transition-all"
              >
                <ArrowLeft size={14} /> Retour à la connexion
              </Link>
            </div>
          )}
        </div>

        {/* Footer simple si pas encore de succès */}
        {!success && (
          <div className="text-center mt-10">
            <Link to="/login" className="flex items-center justify-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-black transition-colors">
              <ArrowLeft size={14} /> Revenir à l'étape précédente
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;