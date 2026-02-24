import { Bell, Search, UserCircle, Menu } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export default function Header() {
  const { admin } = useAuth();

  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      
      {/* 1. Zone Gauche : Recherche (Desktop) ou Espaceur (Mobile) */}
      <div className="flex items-center flex-1">
        {/* Barre de recherche - cachée sur mobile, optimisée sur desktop */}
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une commande, un produit..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
          />
        </div>
        
        {/* Icône de recherche mobile (visible uniquement sur petit écran) */}
        <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Search size={20} />
        </button>
      </div>

      {/* 2. Zone Droite : Notifications & Profil */}
      <div className="flex items-center gap-2 md:gap-6">
        
        {/* Notifications */}
        <button className="relative p-2.5 text-gray-400 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Séparateur vertical (caché sur petit mobile) */}
        <div className="h-8 w-[1px] bg-gray-100 mx-2 hidden sm:block"></div>

        {/* Info Session / Profil */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Administrateur</p>
            <p className="text-xs font-bold text-gray-900 truncate max-w-[150px]">
              {admin?.email?.split('@')[0] || "Session Active"}
            </p>
          </div>
          
          <div className="group relative cursor-pointer">
            <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-tr from-indigo-50 to-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-200/50 group-hover:border-indigo-500 transition-all">
              <UserCircle size={24} className="group-hover:scale-110 transition-transform" />
            </div>
            
            {/* Petit indicateur de statut sur l'avatar */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </div>
    </header>
  );
}