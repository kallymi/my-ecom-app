import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Lock, Save, Loader2, CheckCircle, ArrowLeft, Edit3, LogOut } from "lucide-react";
import Profile from "./Profile";

const ProfileSettings = () => {
  const { user, setUser, logout, token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("info"); // "info" ou "security"

  // State Infos personnelles
  const [infoData, setInfoData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    neighborhood: user?.neighborhood || "",
  });
  const [infoStatus, setInfoStatus] = useState({ loading: false, error: null, success: false });

  // State Sécurité
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });
  const [passStatus, setPassStatus] = useState({ loading: false, error: null, success: false });

  // Gestion des inputs
  const handleInfoChange = (e) => setInfoData({ ...infoData, [e.target.name]: e.target.value });
  const handlePassChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  // Submit infos personnelles
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoStatus({ loading: true, error: null, success: false });

    try {
      const res = await api.put("/users/me", infoData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const updatedUser = res.data.user; // ✅ CORRECT

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setInfoStatus({ loading: false, error: null, success: true });

        setTimeout(() => {
          navigate("/profile"); // pas besoin de reset success ici
        }, 1500);
      }


    } catch (err) {
      setInfoStatus({
        loading: false,
        error: err.response?.data?.message || "Erreur lors de la mise à jour",
        success: false,
      });
    }
  };


  // Submit mot de passe
  const handlePassSubmit = async (e) => {
    e.preventDefault();
    setPassStatus({ loading: true, error: null, success: false });
    try {
      const res = await api.put("/users/me/password", passwordData, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setPassStatus({ loading: false, error: null, success: true });
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setPassStatus({ loading: false, error: err.response?.data?.message || "Erreur lors du changement", success: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-indigo-600 shadow-sm">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mon Profil</h1>
          <div className="w-10"></div>
        </div>

        {/* Carte Profil */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Onglets */}
            <div className="flex gap-4 mb-8 border-b border-gray-100">
              <button 
                onClick={() => setActiveTab("info")}
                className={`flex-1 py-2 text-center font-bold ${activeTab === "info" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-400"}`}>
                Infos personnelles
              </button>
              <button 
                onClick={() => setActiveTab("security")}
                className={`flex-1 py-2 text-center font-bold ${activeTab === "security" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-400"}`}>
                Sécurité
              </button>
            </div>

            {/* Contenu onglets */}
            {activeTab === "info" && (
              <form onSubmit={handleInfoSubmit} className="space-y-5">
                {infoStatus.error && <Alert message={infoStatus.error} type="error" />}
                {infoStatus.success && <Alert message="Profil mis à jour !" type="success" />}
                <InputField label="Nom complet" name="name" icon={<User size={18} />} value={infoData.name} onChange={handleInfoChange} />
                <InputField label="Email" name="email" type="email" icon={<Mail size={18} />} value={infoData.email} onChange={handleInfoChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="Téléphone" name="phone" icon={<Phone size={18} />} value={infoData.phone} onChange={handleInfoChange} />
                  <InputField label="Quartier" name="neighborhood" icon={<MapPin size={18} />} value={infoData.neighborhood} onChange={handleInfoChange} />
                </div>
                <button 
                  type="submit" 
                  disabled={infoStatus.loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-5 rounded-[24px] font-black text-lg transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-3 mt-4">
                  {infoStatus.loading ? <Loader2 className="animate-spin" /> : <Save size={22} />}
                  Enregistrer les modifications
                </button>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handlePassSubmit} className="space-y-5">
                {passStatus.error && <Alert message={passStatus.error} type="error" />}
                {passStatus.success && <Alert message="Mot de passe mis à jour ! Vous serez déconnecté." type="success" />}
                <InputField label="Mot de passe actuel" name="currentPassword" type="password" icon={<Lock size={18} />} value={passwordData.currentPassword} onChange={handlePassChange} />
                <InputField label="Nouveau mot de passe" name="newPassword" type="password" icon={<Lock size={18} />} value={passwordData.newPassword} onChange={handlePassChange} />
                <button 
                  type="submit" 
                  disabled={passStatus.loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-5 rounded-[24px] font-black text-lg transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-3 mt-4">
                  {passStatus.loading ? <Loader2 className="animate-spin" /> : <Save size={22} />}
                  Changer le mot de passe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composants réutilisables
const InputField = ({ label, name, type = "text", icon, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300"
      />
    </div>
  </div>
);

const Alert = ({ message, type }) => (
  <div className={`mb-6 p-4 rounded-2xl font-bold text-sm flex items-center gap-2 ${
    type === "error" ? "bg-rose-50 border border-rose-100 text-rose-600" : "bg-emerald-50 border border-emerald-100 text-emerald-600"
  }`}>
    {type === "success" && <CheckCircle size={18} />}
    {message}
  </div>
);

export default ProfileSettings;
