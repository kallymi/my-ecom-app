import { Bell, Search, UserCircle } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export default function Header() {
  const { admin } = useAuth();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10 px-8 flex items-center justify-between">
      {/* Barre de recherche discrète */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Recherche rapide..." 
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
        />
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Info Session */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-gray-900 leading-none mb-1">Session Active</p>
            <p className="text-[10px] text-gray-500 font-medium">{admin?.email}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <UserCircle size={24} />
          </div>
        </div>
      </div>
    </header>
  );
}