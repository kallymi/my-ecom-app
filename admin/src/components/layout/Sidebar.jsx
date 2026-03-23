import { useNavigate, NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Package, ShoppingCart, Terminal,
  Users, LogOut, RotateCcw, Layers, Trash2, ChevronRight, X 
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext"; // Vérifie bien le chemin vers ton contexte

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    // On force une redirection propre pour vider les caches
    window.location.href = "/login";
  };

  const linkClass = ({ isActive }) => `
    flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group mb-1
    ${isActive 
      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-900/40" 
      : "text-slate-400 hover:bg-white/5 hover:text-white"}
  `;

  return (
    <>
      {/* OVERLAY */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 lg:hidden transition-all duration-500 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* ASIDE CONTAINER */}
      <aside className={`
        fixed top-0 left-0 z-50 
        w-64 md:w-60 lg:w-72 h-screen bg-[#0f172a] text-white 
        flex flex-col border-r border-white/5 
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isOpen ? "translate-x-0 shadow-2xl shadow-black" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* Header (Logo) */}
        <div className="p-6 lg:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Terminal size={20} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">
              CHEEL<span className="text-indigo-500">.</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Corps de navigation */}
        <nav className="flex-1 px-4 overflow-y-auto space-y-8 custom-scrollbar pb-8">
          
          {/* SECTION PRINCIPALE */}
          <div>
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Principal</h3>
            <NavLink to="/admin" end className={linkClass} onClick={onClose}>
              <div className="flex items-center">
                <LayoutDashboard size={18} className="mr-3" />
                <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
              </div>
            </NavLink>
          </div>

          {/* SECTION GESTION */}
          <div>
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Gestion Stocks</h3>
            <div className="space-y-1">
              <NavLink to="/admin/products" className={linkClass} onClick={onClose}>
                <div className="flex items-center">
                  <Package size={18} className="mr-3" />
                  <span className="text-xs font-bold uppercase tracking-widest">Produits</span>
                </div>
              </NavLink>
              <NavLink to="/admin/categories" className={linkClass} onClick={onClose}>
                <div className="flex items-center">
                  <Layers size={18} className="mr-3" />
                  <span className="text-xs font-bold uppercase tracking-widest">Catégories</span>
                </div>
              </NavLink>
              <NavLink to="/admin/users" className={linkClass} onClick={onClose}>
                <div className="flex items-center">
                  <Users size={18} className="mr-3" />
                  <span className="text-xs font-bold uppercase tracking-widest">Clients</span>
                </div>
              </NavLink>
              <NavLink to="/admin/trash" className={linkClass} onClick={onClose}>
                <div className="flex items-center">
                  <Trash2 size={18} className="mr-3 group-hover:text-red-400 transition-colors" />
                  <span className="text-xs font-bold uppercase tracking-widest">Corbeille</span>
                </div>
              </NavLink>
            </div>
          </div>

          {/* SECTION COMMERCE */}
          <div>
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Commerce</h3>
            <div className="space-y-1">
              <NavLink to="/admin/orders" className={linkClass} onClick={onClose}>
                <div className="flex items-center">
                  <ShoppingCart size={18} className="mr-3" />
                  <span className="text-xs font-bold uppercase tracking-widest">Commandes</span>
                </div>
              </NavLink>
              <NavLink to="/admin/returns" className={linkClass} onClick={onClose}>
                <div className="flex items-center">
                  <RotateCcw size={18} className="mr-3" />
                  <span className="text-xs font-bold uppercase tracking-widest">Retours</span>
                </div>
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Footer (User Info + Logout) */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50">
          {/* User Profile Info */}
          <div className="px-4 py-3 mb-4 flex items-center gap-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-[11px] font-black shadow-lg shadow-indigo-500/20">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase truncate tracking-wider">{user?.firstName}</span>
              <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Admin Root</span>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-between w-full p-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all duration-300 group font-black text-[10px] uppercase tracking-widest border border-red-500/20"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
              <span>Déconnexion</span>
            </div>
            <ChevronRight size={14} />
          </button>
        </div>
      </aside>
    </>
  );
}