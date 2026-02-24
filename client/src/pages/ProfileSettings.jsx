import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Lock, ArrowRight, Loader2, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const ProfileSettings = () => {
  const { user, setUser, logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);

  const [infoData, setInfoData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    neighborhood: user?.neighborhood || "",
  });

  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "" });

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/users/me", infoData, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Profil mis à jour");
        setTimeout(() => navigate("/profile"), 1000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white md:bg-[#FAFAFA] pb-20">
      {/* HEADER MOBILE ÉLÉGANT */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-50 md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-black"><ArrowLeft size={20} /></button>
        <span className="font-[1000] uppercase italic tracking-tighter text-sm">Paramètres</span>
        <div className="w-8" />
      </div>

      <div className="max-w-2xl mx-auto md:pt-12 px-6">
        {/* TITRE DESKTOP */}
        <div className="hidden md:block mb-10">
          <h1 className="text-4xl font-[1000] tracking-tighter italic uppercase">Éditer <span className="text-indigo-600">Profil.</span></h1>
        </div>

        {/* SELECTEUR D'ONGLETS SANS BORDURE */}
        <div className="flex gap-8 mb-10 border-b border-gray-100 md:border-none">
          {["info", "security"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                activeTab === tab ? "text-indigo-600" : "text-gray-300"
              }`}
            >
              {tab === "info" ? "Informations" : "Sécurité"}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full animate-in slide-in-from-left-2" />}
            </button>
          ))}
        </div>

        {activeTab === "info" ? (
          <form onSubmit={handleInfoSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-6">
              <ModernInput icon={<User />} label="Nom complet" name="name" value={infoData.name} onChange={(e) => setInfoData({...infoData, name: e.target.value})} />
              <ModernInput icon={<Mail />} label="Email" name="email" type="email" value={infoData.email} onChange={(e) => setInfoData({...infoData, email: e.target.value})} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModernInput icon={<Phone />} label="Téléphone" name="phone" value={infoData.phone} onChange={(e) => setInfoData({...infoData, phone: e.target.value})} />
                <ModernInput icon={<MapPin />} label="Ville / Quartier" name="neighborhood" value={infoData.neighborhood} onChange={(e) => setInfoData({...infoData, neighborhood: e.target.value})} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-black text-white overflow-hidden py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all hover:bg-indigo-600 active:scale-[0.97] shadow-2xl shadow-black/10"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {loading ? "Mise à jour..." : "Confirmer les changements"}
              </div>
            </button>
          </form>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Design Sécurité ici... similaire au style info */}
          </div>
        )}
      </div>
    </div>
  );
};

/* COMPOSANT INPUT MODERNISÉ */
const ModernInput = ({ icon, label, ...props }) => (
  <div className="relative group">
    <label className="absolute -top-2 left-4 px-2 bg-white md:bg-[#FAFAFA] text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-indigo-600 transition-all z-10">
      {label}
    </label>
    <div className="relative flex items-center">
      <div className="absolute left-0 text-gray-300 group-focus-within:text-indigo-600 transition-colors">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <input
        {...props}
        className="w-full pl-8 py-4 bg-transparent border-b border-gray-100 focus:border-indigo-600 outline-none font-bold text-sm text-black transition-all placeholder:text-gray-200"
      />
    </div>
  </div>
);

export default ProfileSettings;