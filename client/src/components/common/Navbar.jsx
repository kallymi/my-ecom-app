import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TruckIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, logout, initializing } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (initializing) {
    return (
      <nav className="bg-blue-600 h-16 flex items-center px-6">
        <div className="w-40 h-6 bg-white/20 rounded animate-pulse"></div>
      </nav>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tight hover:text-blue-200 transition"
        >
          MABOUTIQUE<span className="text-blue-200">.</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="hover:text-blue-200">Accueil</Link>
          <Link to="/shop" className="hover:text-blue-200">Boutique</Link>

          {!user && (
            <Link
              to="/track"
              className="flex items-center gap-1 bg-blue-700 px-3 py-1.5 rounded-xl hover:bg-blue-800 transition"
            >
              <TruckIcon className="h-4 w-4" />
              Suivi colis
            </Link>
          )}

          <Link to="/cart" className="hover:text-blue-200">Panier</Link>

          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl hover:bg-white/20 transition">
                <span className="text-sm font-semibold">{user.name}</span>
              </button>

              <div className="absolute right-0 mt-3 w-56 bg-white text-black rounded-2xl shadow-xl hidden group-hover:block overflow-hidden">
                <Link to="/profile" className="block px-4 py-3 hover:bg-gray-50 font-semibold">
                  Mon profil
                </Link>

                <Link to="/my-orders" className="block px-4 py-3 hover:bg-gray-50 text-blue-600 font-semibold">
                  Mes commandes
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin/orders"
                    className="block px-4 py-3 bg-orange-50 text-orange-600 font-bold"
                  >
                    Administration
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 font-bold"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-100 transition"
            >
              Connexion
            </Link>
          )}
        </div>

        {/* Mobile */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-blue-600 px-4 py-6 space-y-4">
          <Link to="/" onClick={() => setMobileOpen(false)}>Accueil</Link>
          <Link to="/shop" onClick={() => setMobileOpen(false)}>Boutique</Link>
          <Link to="/cart" onClick={() => setMobileOpen(false)}>Panier</Link>

          {!user ? (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block mt-4 py-3 bg-white text-blue-600 text-center rounded-xl font-bold"
            >
              Connexion
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="block mt-4 text-red-200 font-bold"
            >
              Déconnexion
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
