import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  MapPin,
  Phone,
  Shield,
  LogOut,
  Edit3,
  ArrowLeft,
  Lock
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-indigo-600 shadow-sm"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-3xl font-black text-gray-900">Mon Profil</h1>
          <div className="w-10" />
        </div>

        {/* =======================
            Carte identité
        ======================= */}
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-24 h-24 mx-auto bg-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-lg shadow-indigo-200 rotate-3 mb-4">
            <User size={46} className="-rotate-3" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-400 text-sm">{user.email}</p>

          {user.role === 'admin' && (
            <span className="inline-block mt-3 px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
              ADMIN
            </span>
          )}

        </div>

        {/* =======================
            Informations personnelles
        ======================= */}
        <Section title="Informations personnelles">
          <InfoItem icon={<Mail />} label="Email" value={user.email} />
          <InfoItem icon={<Phone />} label="Téléphone" value={user.phone || 'Non renseigné'} />
          <InfoItem icon={<MapPin />} label="Quartier" value={user.neighborhood || 'Non renseigné'} />
          <InfoItem
            icon={<Shield />}
            label="Membre depuis"
            value={new Date(user.createdAt).toLocaleDateString()}
          />

          <ActionButton
            onClick={() => navigate('/profile/settings')}
            icon={<Edit3 size={18} />}
            label="Modifier mes informations"
            primary
          />
        </Section>

        {/* =======================
            Sécurité
        ======================= */}
        <Section title="Sécurité du compte">
          <p className="text-sm text-gray-500 leading-relaxed">
            Pour des raisons de sécurité, la modification du mot de passe est séparée
            des informations personnelles.
          </p>

          <ActionButton
            onClick={() => navigate('/profile/change-password')}
            icon={<Lock size={18} />}
            label="Modifier mon mot de passe"
            warning
          />
        </Section>

        {/* =======================
            Déconnexion
        ======================= */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-6 py-4 rounded-2xl font-bold transition-all"
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

/* =======================
   UI Components
======================= */

const Section = ({ title, children }) => (
  <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8 space-y-6">
    <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
    <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-500">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-gray-900 font-bold break-all">{value}</p>
    </div>
  </div>
);

const ActionButton = ({ onClick, icon, label, primary, warning }) => {
  let style =
    'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50';

  if (primary) {
    style =
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100';
  }

  if (warning) {
    style =
      'bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100';
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${style}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default Profile;
