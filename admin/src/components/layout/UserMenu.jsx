import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { LogOut, User, Settings, ChevronDown, Shield } from "lucide-react";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      {/* TRIGGER : Le badge utilisateur */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-4 bg-white border border-gray-100 rounded-full hover:shadow-md transition-all group"
      >
        {/* Avatar avec Initiales */}
        <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-full flex items-center justify-center text-white text-[10px] md:text-xs font-black ring-2 ring-gray-50">
          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
        </div>

        {/* Infos Textuelles */}
        <div className="hidden md:flex flex-col text-left">
          <span className="text-[10px] font-black uppercase tracking-tight text-black">
            {user.firstName} {user.lastName}
          </span>
          <div className="flex items-center gap-1">
            <Shield size={8} className="text-indigo-600" />
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
              Mode {user.role}
            </span>
          </div>
        </div>

        <ChevronDown 
          size={14} 
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <>
          {/* Overlay pour fermer le menu en cliquant ailleurs */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Session active</p>
              <p className="text-xs font-bold text-black truncate">{user.email}</p>
            </div>

            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors">
                <User size={14} />
                Mon Profil
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors">
                <Settings size={14} />
                Paramètres
              </button>
            </div>

            <div className="p-2 border-t border-gray-50">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;