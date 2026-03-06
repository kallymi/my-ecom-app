import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force le retour en haut de page instantanément
    window.scrollTo(0, 0);
  }, [pathname]); // Se déclenche à chaque changement de chemin (URL)

  return null;
};

export default ScrollToTop;