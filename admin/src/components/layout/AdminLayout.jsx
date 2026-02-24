import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Toaster } from "react-hot-toast";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* 1. SIDEBAR 
        Grâce au "fixed lg:sticky" dans le composant Sidebar, 
        elle restera soit en tiroir sur mobile, soit fixe à gauche sur desktop.
      */}
      <Sidebar />

      {/* 2. CONTENEUR DE DROITE 
        Le "min-w-0" est indispensable pour empêcher les graphiques 
        et les tableaux de casser le layout.
      */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* HEADER : Toujours visible en haut avec son effet de flou */}
        <Header />

        {/* 3. ZONE DE CONTENU PRINCIPAL 
          Le padding "p-4 md:p-8" s'adapte à la taille de l'écran.
        */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 md:p-8 animate-in fade-in duration-500">
            {/* L'Outlet injecte tes pages (Dashboard, EditProduct, etc.) 
               qui héritent automatiquement de ce cadre moderne.
            */}
            <Outlet />
          </div>
        </main>

        {/* FOOTER DISCRET */}
        <footer className="py-6 px-8 border-t border-gray-100 flex justify-between items-center">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
            &copy; 2026 MarketPro Admin Suite
          </p>
          <div className="flex gap-4">
             <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
             <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">System Online</p>
          </div>
        </footer>
      </div>

      {/* 4. GESTIONNAIRE DE NOTIFICATIONS 
        Placé ici, il est disponible pour TOUTES les pages de l'admin.
      */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-bold text-sm rounded-2xl border-none shadow-2xl bg-slate-900 text-white',
          duration: 4000,
        }}
      />
    </div>
  );
}