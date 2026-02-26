import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "react-hot-toast";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      {/* Sidebar : On passe l'état et la fonction de fermeture */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header : On passe la fonction d'ouverture */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1">
          <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}