import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext"; 
import api from "../../api/axios";
import { 
  ShoppingBag, User, Truck, Menu, X, 
  LogOut, LayoutDashboard, Package, ArrowRight
} from "lucide-react";

export default function Navbar() {
  // On utilise logout s'il est dispo dans le context, sinon setUser
  const { user, setUser, logout, initializing } = useAuth(); 
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    try {
      // Si une fonction logout existe dans le context, on l'utilise
      if (logout) {
        await logout();
      } else {
        await api.get("/auth/logout");
        if (setUser) setUser(null);
        localStorage.clear();
      }
      setMobileOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      if (setUser) setUser(null);
      localStorage.clear();
      navigate("/login");
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  if (initializing) return <div className="h-20 bg-white border-b border-gray-50 animate-pulse" />;

  return (
    <nav className={`sticky top-0 z-[100] transition-all duration-500 pt-[env(safe-area-inset-top)]
      ${scrolled ? "bg-white/80 backdrop-blur-xl py-3 shadow-sm" : "bg-white py-5"}`}>
      
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="group flex items-center gap-1">
          <span className="text-2xl font-[1000] tracking-tighter italic text-black uppercase transition-transform group-hover:scale-105">
            Cheel<span className="text-indigo-600 not-italic">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-8">
          {/* NAV DESKTOP */}
          <div className="hidden md:flex items-center gap-8 mr-4">
            <NavLink to="/">Accueil</NavLink>
            <NavLink to="/shop">Boutique</NavLink>
            <NavLink to="/track" icon={<Truck size={14} />}>Suivre</NavLink>
          </div>

          {/* PANIER */}
          <Link to="/cart" className="relative group p-3 transition-transform active:scale-90">
            <ShoppingBag size={22} className="text-black md:text-gray-400 md:group-hover:text-black transition-colors" />
            {totalItems > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[9px] font-[1000] rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </Link>

          {/* COMPTE DESKTOP */}
          <div className="hidden md:block">
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border border-gray-100 hover:border-black transition-all">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black">
                    {user.name?.split(" ")[0]}
                  </span>
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                    <User size={14} />
                  </div>
                </button>
                
                {/* DROPDOWN */}
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl shadow-indigo-200/20 border border-gray-50 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden">
                    <DropdownLink to="/profile" icon={<User size={16}/>} label="Profil" />
                    <DropdownLink to="/my-orders" icon={<Package size={16}/>} label="Commandes" />
                    {user.role === "admin" && <DropdownLink to="/admin/orders" icon={<LayoutDashboard size={16}/>} label="Admin" color="text-indigo-600" bg="bg-indigo-50/50" />}
                    <div className="my-2 border-t border-gray-50" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-rose-500 hover:bg-rose-50 transition-colors text-[10px] font-black uppercase tracking-widest">
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
                Connexion
              </Link>
            )}
          </div>

          <button className="md:hidden p-3 text-black active:scale-90" onClick={() => setMobileOpen(true)}>
            <Menu size={26} />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`md:hidden fixed inset-0 z-[100] transition-all duration-500 ${mobileOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ${mobileOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMobileOpen(false)} />
        
        <div className={`absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl transition-transform duration-500 flex flex-col ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-6 flex justify-between items-center border-b border-gray-50">
            <span className="text-xl font-[1000] italic uppercase tracking-tighter text-black">Menu.</span>
            <button onClick={() => setMobileOpen(false)} className="p-2 bg-gray-50 rounded-full"><X size={20} /></button>
          </div>

          <div className="p-8 flex flex-col gap-6">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">Navigation</p>
            <MobileLink to="/" label="Accueil" />
            <MobileLink to="/shop" label="Boutique" />
            <MobileLink to="/my-orders" label="Mes Commandes" icon={<Package size={18} className="text-indigo-600" />} />
          </div>

          <div className="mt-auto p-8 border-t border-gray-50 bg-gray-50/50">
            {user ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white"><User size={18} /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{user.name}</p>
                    <Link to="/profile" className="text-[10px] text-indigo-600 font-[1000] uppercase tracking-widest border-b-2 border-indigo-100 hover:border-indigo-600 transition-all">Voir Profil</Link>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link to="/login" className="block w-full py-5 bg-black text-white text-center rounded-2xl text-[10px] font-black uppercase tracking-widest">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const NavLink = ({ to, children, icon }) => (
  <Link to={to} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors">{icon}{children}</Link>
);

const DropdownLink = ({ to, icon, label, color = "text-black", bg = "hover:bg-gray-50" }) => (
  <Link to={to} className={`flex items-center gap-3 px-6 py-3.5 transition-colors ${bg} ${color} text-[10px] font-black uppercase tracking-widest`}>{icon} {label}</Link>
);

const MobileLink = ({ to, label, icon }) => (
  <Link to={to} className="flex justify-between items-center group">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-lg font-bold tracking-tight text-black group-hover:text-indigo-600 transition-colors uppercase italic">{label}</span>
    </div>
    <ArrowRight size={16} className="text-gray-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
  </Link>
);