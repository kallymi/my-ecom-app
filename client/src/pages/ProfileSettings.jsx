import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Phone, MapPin, Lock, 
  ArrowLeft, Loader2, ShieldCheck, Sparkles, Eye, EyeOff 
} from "lucide-react";
import toast from "react-hot-toast";

const ProfileSettings = () => {
  const { user, updateUser, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // État pour les infos générales
  const [infoData, setInfoData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    neighborhood: user?.neighborhood || "",
  });

  // Sécurité : synchroniser si 'user' arrive après le premier rendu
  useEffect(() => {
    if (user) {
      setInfoData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        neighborhood: user.neighborhood || "",
      });
    }
  }, [user]);

  // État pour la sécurité
  const [passwordData, setPasswordData] = useState({ 
    currentPassword: "", 
    newPassword: "" 
  });

  // Mise à jour des infos (Profil)
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const dataToSend = { 
        ...infoData,
        email: infoData.email.trim().toLowerCase()
      };

      const res = await api.put("/users/me", dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {

        updateUser(res.data.user);

        toast.success("Profil synchronisé avec succès");

        setTimeout(() => navigate("/profile"), 1000);
      }

    } catch (err) {

      console.error("API ERROR:", err);

      toast.error(
        err.response?.data?.message ||
        "Erreur lors de la mise à jour"
      );

    } finally {
      setLoading(false);
    }
  };

  // Mise à jour du mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      return toast.error("Veuillez remplir tous les champs");
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("Le nouveau mot de passe doit faire 6 caractères minimum");
    }

    setLoading(true);
    try {
      // ✅ Correction de l'URL : /me/password au lieu de /update-password
      const res = await api.put("/users/me/password", passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        toast.success("Sécurité mise à jour");
        setPasswordData({ currentPassword: "", newPassword: "" });
        setActiveTab("info");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur de mot de passe");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white md:bg-[#F8F9FA] pb-24">
      {/* HEADER MOBILE */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl px-6 py-5 flex items-center justify-between border-b border-gray-50 md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-black active:scale-75 transition-transform">
          <ArrowLeft size={22} />
        </button>
        <span className="font-[1000] uppercase italic tracking-tighter text-xs">Mon Compte</span>
        <div className="w-10" />
      </div>

      <div className="max-w-xl mx-auto md:pt-20 px-6">
        {/* TITRE DESKTOP */}
        <div className="hidden md:block mb-12 text-center md:text-left">
          <h1 className="text-5xl font-[1000] tracking-tighter italic uppercase leading-tight">
            Configuration <br /> <span className="text-indigo-600">du compte.</span>
          </h1>
        </div>

        {/* ONGLETS */}
        <div className="flex gap-10 mb-12 border-b border-gray-100 md:border-none overflow-x-auto no-scrollbar justify-center md:justify-start">
          {[
            { id: "info", label: "Informations", icon: <User size={14}/> },
            { id: "security", label: "Sécurité", icon: <Lock size={14}/> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-5 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative flex items-center gap-2 shrink-0 ${
                activeTab === tab.id ? "text-indigo-600" : "text-gray-300 hover:text-gray-500"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full animate-in zoom-in duration-300" />
              )}
            </button>
          ))}
        </div>

        {/* FORMULAIRE INFOS */}
        {activeTab === "info" ? (
          <form onSubmit={handleInfoSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 gap-8 bg-white md:p-10 md:rounded-[2.5rem] md:shadow-xl md:shadow-black/5">
              <ModernInput 
                id="name"
                icon={<User />} 
                label="Nom Complet" 
                value={infoData.name} 
                onChange={(e) => setInfoData({...infoData, name: e.target.value})} 
              />
              <ModernInput 
                id="email"
                icon={<Mail />} 
                label="Adresse Email" 
                type="email" 
                value={infoData.email} 
                onChange={(e) => setInfoData({...infoData, email: e.target.value})} 
                placeholder="votre@email.com"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ModernInput 
                  id="phone"
                  icon={<Phone />} 
                  label="Téléphone" 
                  value={infoData.phone} 
                  onChange={(e) => setInfoData({...infoData, phone: e.target.value})} 
                  placeholder="+235 ..."
                />
                <ModernInput 
                  id="neighborhood"
                  icon={<MapPin />} 
                  label="Quartier / Ville" 
                  value={infoData.neighborhood} 
                  onChange={(e) => setInfoData({...infoData, neighborhood: e.target.value})} 
                  placeholder="Ex: Moursal, N'Djamena"
                />
              </div>
            </div>
            <SubmitButton loading={loading} text="Enregistrer les modifications" />
          </form>
        ) : (
          /* FORMULAIRE SÉCURITÉ */
          <form onSubmit={handlePasswordSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white md:p-10 md:rounded-[2.5rem] md:shadow-xl md:shadow-black/5 space-y-10">
              <div className="flex items-center gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <ShieldCheck className="text-indigo-600 shrink-0" size={24} />
                <p className="text-[10px] font-bold text-indigo-900 leading-relaxed uppercase tracking-wide">
                  Votre sécurité est notre priorité. Utilisez un mot de passe unique.
                </p>
              </div>

              <ModernInput 
                id="currentPassword"
                icon={<Lock />} 
                label="Mot de passe actuel" 
                type={showPassword ? "text" : "password"} 
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                rightElement={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-300 hover:text-indigo-600 transition-colors">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                }
              />

              <ModernInput 
                id="newPassword"
                icon={<Sparkles />} 
                label="Nouveau mot de passe" 
                type={showPassword ? "text" : "password"} 
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              />
            </div>
            <SubmitButton loading={loading} text="Mettre à jour la sécurité" />
          </form>
        )}
      </div>
    </div>
  );
};

/* COMPOSANTS RÉUTILISABLES INTERNES (OPTIMISÉS) */

const ModernInput = ({ icon, label, id, rightElement, ...props }) => (
  <div className="relative group">
    <label htmlFor={id} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-indigo-600 transition-all block mb-2 ml-1">
      {label}
    </label>
    <div className="relative flex items-center border-b-2 border-gray-100 group-focus-within:border-indigo-600 transition-all pb-2">
      <div className="text-gray-300 group-focus-within:text-indigo-600 transition-colors mr-3">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <input
        id={id}
        {...props}
        className="w-full bg-transparent outline-none font-bold text-sm text-black placeholder:text-gray-200"
      />
      {rightElement && <div className="ml-2">{rightElement}</div>}
    </div>
  </div>
);

const SubmitButton = ({ loading, text }) => (
  <button
    type="submit"
    disabled={loading}
    className="group relative w-full bg-black text-white overflow-hidden py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all hover:bg-indigo-600 active:scale-[0.96] shadow-xl shadow-black/10 disabled:opacity-50"
  >
    <div className="flex items-center justify-center gap-4">
      {loading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
      )}
      {loading ? "Traitement en cours..." : text}
    </div>
  </button>
);

export default ProfileSettings;