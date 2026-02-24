import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error('Les mots de passe ne correspondent pas');
    }

    setLoading(true);
    try {
      const res = await api.put('/users/me/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (res.data.success) {
        toast.success('Sécurité mise à jour !');
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-[#FAFAFA] pb-12">
      {/* HEADER MOBILE MINIMALISTE */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-5 flex items-center justify-between border-b border-gray-50 md:hidden">
        <button onClick={() => navigate(-1)} className="text-black"><ArrowLeft size={22} /></button>
        <span className="font-[1000] uppercase italic tracking-tighter text-xs">Sécurité</span>
        <div className="w-6" />
      </div>

      <div className="max-w-xl mx-auto md:pt-20 px-6">
        {/* TITRE INTRODUCTIF */}
        <div className="mb-12 space-y-3">
          <h1 className="text-4xl font-[1000] tracking-tighter italic uppercase leading-none">
            MOT DE <br /><span className="text-indigo-600">PASSE.</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-500" /> 
            Protégez l'accès à votre compte
          </p>
        </div>

        {/* FORMULAIRE ÉPURÉ */}
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-700">
          <div className="space-y-8">
            <ModernInput 
              label="Mot de passe actuel" 
              name="currentPassword" 
              type={showPass ? "text" : "password"}
              value={formData.currentPassword} 
              onChange={handleChange}
              toggleVisible={() => setShowPass(!showPass)}
              showPass={showPass}
            />
            
            <div className="h-[1px] w-full bg-gray-50" />

            <ModernInput 
              label="Nouveau mot de passe" 
              name="newPassword" 
              type={showPass ? "text" : "password"}
              value={formData.newPassword} 
              onChange={handleChange}
            />
            
            <ModernInput 
              label="Confirmation" 
              name="confirmPassword" 
              type={showPass ? "text" : "password"}
              value={formData.confirmPassword} 
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 rounded-2xl font-[1000] uppercase text-[10px] tracking-[0.3em] transition-all active:scale-[0.98] shadow-2xl shadow-black/10 flex items-center justify-center gap-3 disabled:bg-gray-200"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
            {loading ? "Traitement..." : "Mettre à jour"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* COMPOSANT INPUT PREMIUM */
const ModernInput = ({ label, toggleVisible, showPass, ...props }) => (
  <div className="relative group">
    <label className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] group-focus-within:text-indigo-600 transition-colors">
      {label}
    </label>
    <div className="relative flex items-center mt-1">
      <input
        {...props}
        className="w-full py-3 bg-transparent border-b border-gray-100 focus:border-indigo-600 outline-none font-bold text-base text-black transition-all placeholder:text-gray-100"
        placeholder="••••••••"
      />
      {toggleVisible && (
        <button 
          type="button"
          onClick={toggleVisible}
          className="absolute right-0 text-gray-300 hover:text-black transition-colors"
        >
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  </div>
);

export default ChangePassword;