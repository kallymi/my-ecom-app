import React from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import ProductCard from "../../pages/ProductCard";

const MiniStore = ({ products = [], API_URL, navigate, loading }) => {
  if (loading) {
    return (
      <div className="mt-20 px-4 flex gap-6 overflow-hidden">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="min-w-[75%] sm:min-w-[40%] md:min-w-[25%] lg:min-w-[20%] aspect-[4/5] bg-gray-100 animate-pulse rounded-3xl" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-24 md:mt-40 pt-16 border-t border-gray-100">
      {/* Header : Meilleur alignement pour mobile/desktop */}
      <div className="flex items-center justify-between mb-10 px-4 md:px-8 min-w-0">
        <div className="space-y-1">
          <h2 className="text-[clamp(1.6rem,6vw,3.5rem)] font-extrabold uppercase tracking-tight leading-[1.1] break-words">
            Vos <span className="text-indigo-600">Choix.</span>
          </h2>
          <p className="text-gray-400 font-semibold uppercase text-[clamp(0.6rem,2vw,0.75rem)] tracking-[0.2em]">
            Sélection premium pour vous
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/shop')}
          className="hidden md:flex text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-indigo-600 hover:border-indigo-600 transition-colors"
        >
          Tout Voir
        </button>
      </div>

      {/* CONTENEUR DE SCROLL HORIZONTAL */}
      <div className="relative overflow-hidden">
        <div className="flex overflow-x-auto gap-6 px-4 md:px-8 pb-12 no-scrollbar snap-x snap-mandatory">
          {products.map((p) => (
            <div 
              key={p._id} 
              className="min-w-[75%] sm:min-w-[40%] md:min-w-[30%] lg:min-w-[22%] snap-start"
            >
              <ProductCard 
                product={p} 
                API_URL={API_URL} 
                navigate={navigate} 
              />
            </div>
          ))}
          
          {/* Carte "Voir Plus" - Design harmonisé avec les produits */}
          <div className="min-w-[75%] sm:min-w-[40%] md:min-w-[20%] flex items-center justify-center snap-start bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <button 
               onClick={() => navigate('/shop')}
               className="flex flex-col items-center gap-4 group p-8"
             >
               <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ArrowRightIcon className="h-8 w-8" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tout explorer</span>
             </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiniStore;