import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  // On retourne le JSX proprement
  if (loading) {
    return <div className="p-4">Chargement...</div>;
  }

  // Si pas d'utilisateur, on redirige vers le login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si admin requis mais rôle incorrect, on redirige
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
