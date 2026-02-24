import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  ShoppingBag, 
  User, 
  Truck, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  Package 
} from "lucide-react";

export default function Navbar() {
  const { user, logout, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Effet de scroll pour changer l'apparence
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de page
  useEffect(() => setMobileOpen(false), [location]);

  if (initializing) {
    return <div className="h-20 bg-white border-b border-gray-50 animate-pulse" />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={`sticky top-0 z-[100] transition-all duration-500 ${
      scrolled 
      ? "bg-white/80 backdrop-blur-xl py-3 shadow-sm" 
      : "bg-white py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO CHEEL */}
        <Link to="/" className="group flex items-center gap-1">
          <span className="text-3xl font-[1000] tracking-tighter italic text-black uppercase transition-transform group-hover:scale-105">
            Cheel<span className="text-indigo-600 not-italic">.</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-10">
          <NavLink to="/">Accueil</NavLink>
          <NavLink to="/shop">Boutique</NavLink>
          <NavLink to="/track" icon={<Truck size={16} />}>Suivre</NavLink>
          
          <div className="h-6 w-[1px] bg-gray-100" />

          {/* Panier */}
          <Link to="/cart" className="relative p-2 text-gray-400 hover:text-black transition-colors">
            <ShoppingBag size={22} />
            <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              2
            </span>
          </Link>

          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                <span className="text-[10px] font-[1000] uppercase tracking-widest pl-2">
                   {user.name.split(' ')[0]}
                </span>
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs">
                  <User size={16} />
                </div>
              </button>

              {/* DROPDOWN */}
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-[2rem] shadow-2xl shadow-indigo-200/20 border border-gray-50 py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <DropdownLink to="/profile" icon={<User size={16}/>} label="Mon Compte" />
                <DropdownLink to="/my-orders" icon={<Package size={16}/>} label="Mes Commandes" color="text-indigo-600" />
                
                {user.role === "admin" && (
                  <DropdownLink to="/admin/orders" icon={<LayoutDashboard size={16}/>} label="Administration" color="text-orange-600" bg="bg-orange-50/50" />
                )}

                <div className="my-2 border-t border-gray-50" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-6 py-3 text-rose-600 hover:bg-rose-50 transition-colors text-[11px] font-[1000] uppercase tracking-widest"
                >
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-[1000] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200 active:scale-95"
            >
              Connexion
            </Link>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="md:hidden p-2 text-black"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-white z-[90] p-8 animate-in slide-in-from-right duration-500">
          <div className="flex flex-col gap-8">
            <MobileLink to="/" label="Accueil" />
            <MobileLink to="/shop" label="Boutique" />
            <MobileLink to="/track" label="Suivi de colis" />
            <MobileLink to="/cart" label="Panier (2)" />

            <div className="pt-8 border-t border-gray-100 space-y-4">
              {user ? (
                <>
                  <Link to="/profile" className="block text-2xl font-[1000] uppercase tracking-tighter">Mon Profil</Link>
                  <button onClick={handleLogout} className="text-rose-600 font-black uppercase text-xs tracking-[0.2em]">Déconnexion</button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block w-full py-5 bg-black text-white text-center rounded-[2rem] font-[1000] uppercase text-xs tracking-widest"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// --- SOUS-COMPOSANTS ---

const NavLink = ({ to, children, icon }) => (
  <Link 
    to={to} 
    className="flex items-center gap-2 text-[10px] font-[1000] uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
  >
    {icon}
    {children}
  </Link>
);

const DropdownLink = ({ to, icon, label, color = "text-black", bg = "hover:bg-gray-50" }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-6 py-4 transition-colors ${bg} ${color} text-[11px] font-[1000] uppercase tracking-widest`}
  >
    {icon} {label}
  </Link>
);

const MobileLink = ({ to, label }) => (
  <Link to={to} className="text-4xl font-[1000] uppercase tracking-tighter hover:text-indigo-600 transition-colors">
    {label}
  </Link>
);