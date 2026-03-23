import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "react-hot-toast";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      {/* Sidebar : gère son propre affichage (fixe sur mobile/tablette, permanent sur desktop via Sidebar.jsx) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Le conteneur flex-1 doit avoir une marge à gauche (ML) 
          égale à la largeur de la sidebar pour ne pas être recouvert.
          On l'aligne sur les points de rupture de ta Sidebar.
      */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500 md:ml-60 lg:ml-72">
        
        {/* Header : On passe la fonction d'ouverture */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1">
          {/* Ajustement du padding sur tablette (md:p-6) pour gagner de la place */}
          <div className="p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}