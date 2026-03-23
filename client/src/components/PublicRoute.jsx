import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CircularProgress, Box } from "@mui/material";

const PublicRoute = () => {
  const { isAuthenticated, initializing } = useAuth();

  // On attend que le système sache si l'utilisateur est connecté
  if (initializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // SI l'utilisateur est déjà connecté, on le redirige vers l'accueil (ou le dashboard)
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // SINON, on affiche les pages (Login, Register, etc.)
  return <Outlet />;
};

export default PublicRoute;