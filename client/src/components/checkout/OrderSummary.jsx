import React from 'react';
import { ShieldCheck, ShoppingBag, Tag } from 'lucide-react';
import { getMainImage } from "../../utils/getMainImage";

export const OrderSummary = ({ cart, cartTotal, totalSavings }) => {
  return (
    <aside className="lg:col-span-5 lg:sticky lg:top-24 w-full">
      <div className="bg-black text-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden border border-white/5">
        
        {/* Glow Effect Indigo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/15 blur-[60px] pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="text-xl md:text-2xl font-[1000] uppercase italic tracking-tighter flex items-center gap-3">
            Panier <span className="text-[10px] not-italic font-black text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-lg">{cart.length}</span>
          </h3>
          <ShoppingBag size={20} className="text-white/20" />
        </div>

        {/* Cart Items List */}
        <div className="space-y-6 mb-8 max-h-[300px] md:max-h-[450px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
          {cart.map((item, i) => {
            const p = item.product;
            // On récupère les prix avec des fallbacks pour éviter le "0"
            const originalPrice = p?.price || 0;
            const finalPrice = p?.finalPrice || originalPrice; 
            const hasPromo = p?.isPromoValid || (finalPrice < originalPrice);

            return (
              <div key={i} className="flex gap-4 items-center group animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Image du produit */}
                <div className="w-14 h-18 md:w-16 md:h-20 bg-white/5 rounded-xl md:rounded-2xl overflow-hidden shrink-0 border border-white/10 relative">
                   <img 
                     src={getMainImage(p)} 
                     className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                     alt={p?.name} 
                   />
                   {hasPromo && (
                     <div className="absolute top-1 left-1 bg-indigo-600 text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                       PROMO
                     </div>
                   )}
                </div>
                
                {/* Infos Prix & Nom */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.05em] text-white/90 mb-1 truncate">
                    {p?.name || "Produit"}
                  </h4>
                  
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      
                      {/* Quantité badge */}
                      <span className="text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-1.5 rounded">
                        x{item.quantity}
                      </span>
                    </div>

                    {/* Affichage du prix original barré si promo */}
                    {hasPromo && (
                      <span className="text-[9px] font-bold text-white/20 line-through tracking-wider uppercase">
                        {(originalPrice * item.quantity).toLocaleString()} FCFA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals Section */}
        <div className="space-y-4 pt-6 border-t border-white/10 relative z-10">
          {totalSavings > 0 && (
            <div className="flex justify-between items-center bg-indigo-600/10 p-4 rounded-2xl border border-indigo-600/20">
              <div className="flex items-center gap-2 text-indigo-400">
                <Tag size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Économie CHEEL.</span>
              </div>
              <span className="text-xs font-[1000] text-indigo-400">-{totalSavings.toLocaleString()} FCFA</span>
            </div>
          )}

          <div className="flex justify-between items-end px-1">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Total TTC</span>
              <p className="text-4xl md:text-5xl font-[1000] tracking-tighter italic leading-none text-white">
                {cartTotal?.toLocaleString()}
                <span className="text-[10px] font-black not-italic ml-1 text-indigo-500 uppercase">FCFA</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info Livraison */}
        <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
            <ShieldCheck size={20} />
          </div>
          <p className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase tracking-widest leading-tight">
            Transaction sécurisée.<br/>Expédition immédiate à <span className="text-white">N'Djamena</span>.
          </p>
        </div>
      </div>
    </aside>
  );
};