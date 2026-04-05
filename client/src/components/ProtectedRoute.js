import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  // 1. ÉTAPE DE CHARGEMENT : On bloque TOUT tant que l'API /me n'a pas répondu
  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          Vérification du protocole...
        </p>
      </div>
    );
  }

  // 2. ÉTAPE D'AUTHENTIFICATION : Si après init, on n'est pas connecté
  if (!isAuthenticated) {
    // On sauvegarde l'endroit où l'utilisateur voulait aller (state={{ from: location }})
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. ÉTAPE D'AUTORISATION (ADMIN) : Vérifie si les données user sont présentes
  if (adminOnly) {
    // Sécurité supplémentaire : si user est vide ou n'est pas admin
    if (!user || user.role !== 'admin') {
      return <Navigate to="/" replace />; 
    }
  }

  // 4. TOUT EST OK : On affiche la page demandée
  return <Outlet />;
};

export default ProtectedRoute;