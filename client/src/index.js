import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// Cette fonction attend que le HTML soit totalement parsé
const startApp = () => {
  const container = document.getElementById("root");
  if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
  } else {
    console.error("Élément #root introuvable.");
  }
};

// Écoute l'événement de fin de chargement du HTML
window.addEventListener('DOMContentLoaded', startApp);