import React from "react";
import { SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import ProductCard from "../../pages/ProductCard";

const MiniStore = ({ products = [], API_URL, navigate, loading }) => {
  
  if (loading) {
    return (
      <div className="mt-20 px-4 flex gap-4 overflow-hidden">
        {[1, 2, 3].map((n) => (
          <div key={n} className="min-w-[70%] md:min-w-[25%] aspect-[4/5] bg-gray-100 animate-pulse rounded-[2rem]" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-24 md:mt-40 pt-16 border-t border-gray-50">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 px-4 md:px-2">
        <div className="space-y-1">
          <h2 className="text-[8vw] md:text-5xl font-[1000] uppercase tracking-tighter italic">
            Vos <span className="text-indigo-600">Choix.</span>
          </h2>
          <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em]">
            Sélectionnés pour vous
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/shop')}
          className="text-[10px] font-black uppercase tracking-widest border-b-2 border-indigo-600 pb-1"
        >
          Voir Tout 
        </button>
      </div>

      {/* CONTENEUR DE SCROLL HORIZONTAL */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-4 px-4 md:px-2 pb-8 no-scrollbar snap-x snap-mandatory">
          {products.map((p) => (
            <div 
              key={p._id} 
              className="min-w-[75%] sm:min-w-[45%] md:min-w-[30%] lg:min-w-[22%] snap-start"
            >
              <ProductCard 
                product={p} 
                API_URL={API_URL} 
                navigate={navigate} 
              />
            </div>
          ))}
          
          {/* Carte "Voir Plus" à la fin du scroll */}
          <div className="min-w-[50%] sm:min-w-[30%] flex items-center justify-center snap-start">
             <button 
               onClick={() => navigate('/shop')}
               className="flex flex-col items-center gap-4 group"
             >
               <div className="w-16 h-16 rounded-full border-2 border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                 <ArrowRightIcon className="h-6 w-6" />
               </div>
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tout explorer</span>
             </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiniStore;