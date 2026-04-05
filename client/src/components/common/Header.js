import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext"; 
import api from "../../api/axios";
import { 
  ShoppingBag, User, Truck, Menu, X, 
  LogOut, LayoutDashboard, Package, ArrowRight, Zap
} from "lucide-react";

export default function Navbar() {
  const { user, setUser, logout, initializing } = useAuth(); 
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = async () => {
    try {
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
      ${scrolled ? "bg-white/90 backdrop-blur-xl py-3 shadow-sm border-b border-slate-100" : "bg-white py-5"}`}>
      
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
            <NavLink to="/track-order" icon={<Truck size={14} className="text-indigo-500" />}>Suivre</NavLink>
          </div>

          {/* PANIER - Avec badge animé */}
          <Link to="/cart" className="relative group p-3 transition-transform active:scale-90">
            <ShoppingBag size={22} className="text-black transition-colors" />
            {totalItems > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[9px] font-[1000] rounded-full flex items-center justify-center border-2 border-white animate-bounce-short">
                {totalItems}
              </span>
            )}
          </Link>

          {/* COMPTE DESKTOP */}
          <div className="hidden md:block">
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border border-slate-100 hover:border-black hover:bg-slate-50 transition-all">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-black">
                    {user.name?.split(" ")[0]}
                  </span>
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white shadow-lg shadow-slate-200">
                    <User size={14} />
                  </div>
                </button>
                
                {/* DROPDOWN - Design arrondi comme tes fiches */}
                <div className="absolute right-0 mt-3 w-60 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/40 border border-slate-50 py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 overflow-hidden">
                    <p className="px-7 pb-2 text-[8px] font-black uppercase tracking-widest text-slate-300">Mon Espace</p>
                    <DropdownLink to="/profile" icon={<User size={16}/>} label="Profil" />
                    <DropdownLink to="/my-orders" icon={<Package size={16}/>} label="Commandes" />
                    {user.role === "admin" && (
                      <DropdownLink to="/admin/dashboard" icon={<LayoutDashboard size={16}/>} label="Tableau de bord" color="text-indigo-600" bg="bg-indigo-50/50" />
                    )}
                    <div className="mx-6 my-2 border-t border-slate-50" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-7 py-3 text-rose-500 hover:bg-rose-50 transition-colors text-[10px] font-black uppercase tracking-widest">
                        <LogOut size={16} /> Déconnexion
                    </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="px-7 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-95">
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
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500 ${mobileOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMobileOpen(false)} />
        
        <div className={`absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl transition-transform duration-500 flex flex-col rounded-l-[3rem] ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-8 flex justify-between items-center border-b border-slate-50">
            <span className="text-xl font-[1000] italic uppercase tracking-tighter text-black">Menu<span className="text-indigo-600">.</span></span>
            <button onClick={() => setMobileOpen(false)} className="p-3 bg-slate-50 rounded-full text-slate-400 active:rotate-90 transition-transform"><X size={20} /></button>
          </div>

          <div className="p-8 flex flex-col gap-6">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Navigation rapide</p>
            <MobileLink to="/" label="Accueil" />
            <MobileLink to="/shop" label="Boutique" />
            <MobileLink to="/track-order" label="Suivi Colis" icon={<Truck size={20} className="text-indigo-500" />} />
          </div>

          <div className="mt-auto p-8 rounded-t-[3rem] bg-slate-50">
            {user ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200"><User size={22} /></div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight text-slate-900">{user.name}</p>
                    <Link to="/profile" className="text-[9px] text-indigo-600 font-black uppercase tracking-[0.2em]">Mon Compte</Link>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all">
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                 <Link to="/login" className="flex items-center justify-center gap-3 w-full py-5 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200">
                  Accéder au compte
                </Link>
                <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">Paiement 100% sécurisé</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// Composants internes stylisés
const NavLink = ({ to, children, icon }) => (
  <Link to={to} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-black transition-all hover:-translate-y-0.5">{icon}{children}</Link>
);

const DropdownLink = ({ to, icon, label, color = "text-slate-700", bg = "hover:bg-slate-50" }) => (
  <Link to={to} className={`flex items-center gap-4 px-7 py-3.5 transition-colors ${bg} ${color} text-[10px] font-black uppercase tracking-widest`}>{icon} {label}</Link>
);

const MobileLink = ({ to, label, icon }) => (
  <Link to={to} className="flex justify-between items-center group py-2">
    <div className="flex items-center gap-4">
      {icon ? icon : <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
      <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic">{label}</span>
    </div>
    <ArrowRight size={18} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
  </Link>
);