import { Bell, Search, Menu } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import UserMenu from "./UserMenu"; // On importe ton nouveau composant

export default function Header({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      
      {/* Zone Gauche : Menu Mobile + Recherche */}
      <div className="flex items-center gap-4 flex-1">
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
            placeholder="Rechercher une commande, un client..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
          />
        </div>
      </div>

      {/* Zone Droite : Actions & Profil Dynamique */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button className="relative p-2.5 text-gray-400 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Séparateur vertical discret */}
        <div className="h-8 w-[1px] bg-gray-100 mx-2 hidden sm:block"></div>

        {/* C'est ici qu'on insère le UserMenu à la place de l'ancien bloc statique */}
        <UserMenu />
      </div>
    </header>
  );
}