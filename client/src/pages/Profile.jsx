import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, MapPin, Phone, Shield, 
  LogOut, Edit3, ArrowLeft, Lock, Calendar
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* HEADER & NAV */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-black group-hover:text-white transition-all">
                <ArrowLeft size={16} />
            </div>
            Retour
          </button>
          
          <div className="text-right">
            <h1 className="text-4xl md:text-5xl font-[1000] tracking-tighter italic text-black uppercase leading-none">
              MON <span className="text-indigo-600">PROFIL.</span>
            </h1>
          </div>
        </div>

        {/* CARTE D'IDENTITÉ PRINCIPALE */}
        <div className="relative bg-black rounded-[3rem] p-8 md:p-12 overflow-hidden shadow-2xl shadow-indigo-200/20">
          {/* Décoration d'arrière-plan */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center text-black shadow-xl rotate-3">
              <User size={50} className="-rotate-3" />
            </div>
            
            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h2 className="text-3xl font-[1000] text-white uppercase italic tracking-tighter">
                  {user.name}
                </h2>
                {user.role === 'admin' && (
                  <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest ring-4 ring-indigo-500/20">
                    Propriétaire
                  </span>
                )}
              </div>
              <p className="text-indigo-200/70 font-medium tracking-wide">{user.email}</p>
            </div>
          </div>
        </div>

        {/* GRILLE D'INFORMATIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section: Coordonnées */}
          <Section title="Coordonnées">
            <div className="grid grid-cols-1 gap-4">
                <InfoItem icon={<Mail size={16}/>} label="Email" value={user.email} />
                <InfoItem icon={<Phone size={16}/>} label="Téléphone" value={user.phone || 'Non renseigné'} />
                <InfoItem icon={<MapPin size={16}/>} label="Localisation" value={user.neighborhood || 'Non renseigné'} />
            </div>
            <ActionButton
              onClick={() => navigate('/profile/settings')}
              icon={<Edit3 size={16} />}
              label="Mettre à jour les infos"
              primary
            />
          </Section>

          {/* Section: Sécurité & Système */}
          <Section title="Compte & Sécurité">
            <div className="grid grid-cols-1 gap-4">
                <InfoItem icon={<Calendar size={16}/>} label="Membre depuis" value={new Date(user.createdAt).toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'})} />
                <InfoItem icon={<Shield size={16}/>} label="Niveau d'accès" value={user.role === 'admin' ? 'Accès Total' : 'Client Standard'} />
            </div>
            
            <div className="space-y-4">
                <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed px-2 italic">
                    La sécurité de vos données est notre priorité. Modifiez régulièrement votre accès.
                </p>
                <ActionButton
                    onClick={() => navigate('/profile/change-password')}
                    icon={<Lock size={16} />}
                    label="Changer le mot de passe"
                    warning
                />
            </div>
          </Section>

        </div>

        {/* LOGOUT FOOTER */}
        <div className="flex justify-center pt-6">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="group flex items-center gap-3 bg-white border border-gray-100 text-gray-400 hover:text-rose-600 hover:border-rose-100 px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-sm hover:shadow-xl hover:shadow-rose-100/50 active:scale-95"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Clôturer la session
          </button>
        </div>

      </div>
    </div>
  );
};

/* =======================
    COMPOSANTS INTERNES (UI)
======================= */

const Section = ({ title, children }) => (
  <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 space-y-8 flex flex-col justify-between">
    <div>
        <h3 className="text-xs font-[1000] text-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
            {title}
        </h3>
        <div className="space-y-3">{children}</div>
    </div>
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAFAFA] border border-gray-50 group hover:border-indigo-100 transition-colors">
    <div className="p-2.5 bg-white rounded-xl shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-sm font-bold text-black truncate">{value}</p>
    </div>
  </div>
);

const ActionButton = ({ onClick, icon, label, primary, warning }) => {
  let style = 'bg-gray-50 text-gray-600 hover:bg-black hover:text-white';
  if (primary) style = 'bg-black text-white hover:bg-indigo-600 shadow-lg shadow-gray-200';
  if (warning) style = 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-500 hover:text-white';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 ${style}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default Profile;