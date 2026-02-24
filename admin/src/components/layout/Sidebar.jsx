import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Package, Tag, ShoppingCart, 
  Users, LogOut, Sparkles, Trash2, Undo2, ChevronRight, Menu, X 
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // État pour le menu mobile

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const linkClass = ({ isActive }) => `
    flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group mb-1
    ${isActive 
      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/20 scale-[1.02]" 
      : "text-slate-400 hover:bg-white/5 hover:text-indigo-300"}
  `;

  return (
    <>
      {/* --- MOBILE HEADER (Visible uniquement sur mobile) --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-white/5 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-indigo-400" />
          <span className="text-white font-black tracking-tight text-sm uppercase">MarketPro</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-2 text-white bg-white/5 rounded-xl border border-white/10"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- OVERLAY (Flou d'arrière-plan sur mobile) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* --- ASIDE (La Sidebar) --- */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40
        w-72 h-screen bg-[#0f172a] text-white 
        flex flex-col p-4 border-r border-white/5 
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* Logo Section */}
        <div className="px-4 py-8 lg:py-10 relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-600/10 blur-3xl rounded-full"></div>
          <div className="flex items-center gap-3 relative">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase">
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

        {/* Navigation - On ferme la sidebar au clic sur mobile */}
        <nav 
          className="flex-1 px-2 overflow-y-auto custom-scrollbar space-y-6"
          onClick={() => setIsOpen(false)} 
        >
          {/* VUE D'ENSEMBLE */}
          <div>
            <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Vue d'ensemble</p>
            <NavLink to="/admin" end className={linkClass}>
              <div className="flex items-center">
                <LayoutDashboard size={18} className="mr-3 stroke-[1.5]" />
                <span className="text-sm font-semibold">Dashboard</span>
              </div>
            </NavLink>
          </div>

          {/* COMMERCE */}
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
            <NavLink to="/admin/returns" className={linkClass}>
              <div className="flex items-center">
                <Undo2 size={18} className="mr-3 stroke-[1.5]" />
                <span className="text-sm font-semibold">Retours</span>
              </div>
              <span className="bg-amber-500/20 text-amber-500 text-[10px] px-2 py-0.5 rounded-full font-bold">New</span>
            </NavLink>
            <NavLink to="/admin/categories" className={linkClass}>
              <div className="flex items-center">
                <Tag size={18} className="mr-3 stroke-[1.5]" />
                <span className="text-sm font-semibold">Catégories</span>
              </div>
            </NavLink>
          </div>

          {/* ADMINISTRATION */}
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

        {/* Footer Sidebar */}
        <div className="mt-auto pt-4">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-between w-full p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-2xl text-red-400 transition-all group"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold">Quitter</span>
            </div>
            <ChevronRight size={14} className="opacity-50" />
          </button>
        </div>
      </aside>

      {/* --- ESPACEUR POUR LE CONTENU (Mobile uniquement) --- */}
      <div className="h-16 lg:hidden"></div>
    </>
  );
}