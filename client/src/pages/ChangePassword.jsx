import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

const ChangePassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ loading: false, error: 'Les mots de passe ne correspondent pas', success: false });
      return;
    }

    setStatus({ loading: true, error: null, success: false });

    try {
      const res = await api.put('/users/me/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (res.data.success) {
        setStatus({ loading: false, error: null, success: true });
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (err) {
      setStatus({
        loading: false,
        error: err.response?.data?.message || 'Erreur lors du changement de mot de passe',
        success: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Changer le mot de passe</h2>
            <p className="text-gray-500 font-medium mb-10">
              Pour des raisons de sécurité, vous devez entrer votre mot de passe actuel.
            </p>

            {status.error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl font-bold text-sm">
                {status.error}
              </div>
            )}

            {status.success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl font-bold text-sm flex items-center gap-2">
                <CheckCircle size={18} />
                Mot de passe changé avec succès !
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Mot de passe actuel"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                icon={<Lock size={18} />}
              />
              <InputField
                label="Nouveau mot de passe"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                icon={<Lock size={18} />}
              />
              <InputField
                label="Confirmer le nouveau mot de passe"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={<Lock size={18} />}
              />

              <button
                type="submit"
                disabled={status.loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-5 rounded-[24px] font-black text-lg transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 mt-8"
              >
                {status.loading ? <Loader2 className="animate-spin" /> : <Lock size={22} />}
                Changer le mot de passe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, type = 'text', value, onChange, icon }) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-4 py-4 rounded-2xl font-bold outline-none bg-gray-50 ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  </div>
);

export default ChangePassword;
