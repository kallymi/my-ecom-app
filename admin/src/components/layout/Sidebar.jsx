import { useNavigate, NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Package, Tag, ShoppingCart, 
  Users, LogOut, Sparkles, Trash2, Undo2, ChevronRight
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  }

  // Style des liens amélioré
  const linkClass = ({ isActive }) => `
    flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group mb-1
    ${isActive 
      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/20 scale-[1.02]" 
      : "text-slate-400 hover:bg-white/5 hover:text-indigo-300"}
  `;

  return (
    <aside className="w-72 bg-[#0f172a] text-white min-h-screen flex flex-col p-4 border-r border-white/5 sticky top-0 h-screen overflow-hidden">
      
      {/* Logo */}
      <div className="px-4 py-10 relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-600/10 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">
            MARKET<span className="text-indigo-400">PRO</span>
          </span>
        </div>
      </div>
      
      {/* Profil Admin */}
      <div className="mx-2 mb-8 p-4 rounded-[2rem] bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user?.name || "Admin"}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">En ligne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 overflow-y-auto custom-scrollbar space-y-6">
        
        {/* SECTION: VUE D'ENSEMBLE */}
        <div>
          <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Vue d'ensemble</p>
          <NavLink to="/admin" end className={linkClass}>
            <div className="flex items-center">
              <LayoutDashboard size={18} className="mr-3 stroke-[1.5]" />
              <span className="text-sm font-semibold">Dashboard</span>
            </div>
          </NavLink>
        </div>

        {/* SECTION: COMMERCE (Le coeur de ton app) */}
        <div>
          <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Commerce</p>
          
          <NavLink to="/admin/products" className={linkClass}>
            <div className="flex items-center">
              <Package size={18} className="mr-3 stroke-[1.5]" />
              <span className="text-sm font-semibold">Produits</span>
            </div>
          </NavLink>

          <NavLink to="/admin/orders" className={linkClass}>
            <div className="flex items-center">
              <ShoppingCart size={18} className="mr-3 stroke-[1.5]" />
              <span className="text-sm font-semibold">Commandes</span>
            </div>
          </NavLink>

          {/* NOUVEAU: GESTION DES RETOURS */}
          <NavLink to="/admin/returns" className={linkClass}>
            <div className="flex items-center">
              <Undo2 size={18} className="mr-3 stroke-[1.5]" />
              <span className="text-sm font-semibold">Retours Client</span>
            </div>
            {/* Petit badge optionnel si tu as des retours en attente */}
            <span className="bg-amber-500/20 text-amber-500 text-[10px] px-2 py-0.5 rounded-full font-bold">New</span>
          </NavLink>

          <NavLink to="/admin/categories" className={linkClass}>
            <div className="flex items-center">
              <Tag size={18} className="mr-3 stroke-[1.5]" />
              <span className="text-sm font-semibold">Catégories</span>
            </div>
          </NavLink>
        </div>

        {/* SECTION: ADMINISTRATION */}
        <div>
          <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Admin</p>
          
          <NavLink to="/admin/users" className={linkClass}>
            <div className="flex items-center">
              <Users size={18} className="mr-3 stroke-[1.5]" />
              <span className="text-sm font-semibold">Utilisateurs</span>
            </div>
          </NavLink>

          <NavLink to="/admin/trash" className={linkClass}>
            <div className="flex items-center">
              <Trash2 size={18} className="mr-3 stroke-[1.5]" />
              <span className="text-sm font-semibold">Corbeille</span>
            </div>
          </NavLink>
        </div>
      </nav>

      {/* Pied de Sidebar */}
      <div className="mt-auto pt-4">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-between w-full p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl text-red-400 transition-all group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Quitter la session</span>
          </div>
          <ChevronRight size={14} className="opacity-50" />
        </button>
      </div>
    </aside>
  );
}