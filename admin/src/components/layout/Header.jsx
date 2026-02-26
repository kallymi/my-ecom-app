import { Bell, Search, UserCircle, Menu } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export default function Header({ onMenuClick }) { // Reçoit l'action du parent
  const { user } = useAuth();

  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      
      {/* Zone Gauche : Menu Mobile + Recherche */}
      <div className="flex items-center gap-4 flex-1">
        {/* BOUTON MENU MOBILE */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2.5 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-900/20 active:scale-95 transition-all"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
          />
        </div>
      </div>

      {/* Zone Droite : Actions & Profil */}
      <div className="flex items-center gap-2 md:gap-6">
        <button className="relative p-2.5 text-gray-400 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-100 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status: Admin</p>
            <p className="text-xs font-bold text-gray-900">{user?.name || "Session"}</p>
          </div>
          
          <div className="w-10 h-10 md:w-11 md:h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 border-2 border-white">
            <span className="font-black text-sm">{user?.name?.charAt(0).toUpperCase() || "A"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}