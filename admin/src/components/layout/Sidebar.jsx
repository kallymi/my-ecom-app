import { useNavigate, NavLink } from "react-router-dom";
import { 
  LayoutDashboard, Package, ShoppingCart, Terminal,
  Users, LogOut, Sparkles, RotateCcw ,Trash2, Undo2, ChevronRight, X, Tag
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }) => `
    flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group mb-1
    ${isActive 
      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-900/40" 
      : "text-slate-400 hover:bg-white/5 hover:text-white"}
  `;

  return (
    <>
      {/* OVERLAY : Flou arrière-plan */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 lg:hidden transition-all duration-500 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* ASIDE CONTAINER */}
      <aside className={`
        fixed top-0 left-0 z-50 w-72 h-screen bg-[#0f172a] text-white 
        flex flex-col border-r border-white/5 
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isOpen ? "translate-x-0 shadow-2xl shadow-black" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* Header de la Sidebar (Logo + Close btn) */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Terminal size={20} className="text-white" />
            </div>
            
            <span className="text-xl font-black tracking-tighter uppercase italic">
              CHEEL<span className="text-indigo-500"></span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Corps de navigation */}
        <nav className="flex-1 px-4 overflow-y-auto space-y-8 custom-scrollbar">
          
          <div>
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Principal</h3>
            <NavLink to="/admin" end className={linkClass} onClick={onClose}>
              <div className="flex items-center">
                <LayoutDashboard size={18} className="mr-3" />
                <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
              </div>
            </NavLink>
          </div>

          <div>
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Commerce</h3>
            <div className="space-y-1">
                <NavLink to="/admin/products" className={linkClass} onClick={onClose}>
                    <div className="flex items-center"> <Package size={18} className="mr-3" /> <span className="text-xs font-bold uppercase tracking-widest">Produits</span> </div>
                </NavLink>
                <NavLink to="/admin/orders" className={linkClass} onClick={onClose}>
                    <div className="flex items-center"> <ShoppingCart size={18} className="mr-3" /> <span className="text-xs font-bold uppercase tracking-widest">Commandes</span> </div>
                </NavLink>
                <NavLink to="/admin/users" className={linkClass} onClick={onClose}>
                    <div className="flex items-center"> <Users size={18} className="mr-3" /> <span className="text-xs font-bold uppercase tracking-widest">Clients</span> </div>
                </NavLink>
                <NavLink to="/admin/returns" className={linkClass} onClick={onClose}>
                  <div className="flex items-center"> 
                    <RotateCcw size={18} className="mr-3 stroke-[2]" /> 
                    <span className="text-xs font-bold uppercase tracking-widest">Retours Commandes</span> 
                  </div>
                </NavLink>
            </div>
          </div>
        </nav>

        {/* Footer Sidebar (Logout) */}
        <div className="p-4 border-t border-white/5 bg-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-between w-full p-4 bg-red-500 text-white rounded-[1.5rem] shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span>Déconnexion</span>
            </div>
            <ChevronRight size={14} />
          </button>
        </div>
      </aside>
    </>
  );
}