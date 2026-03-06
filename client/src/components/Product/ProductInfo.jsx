import React from "react";
import { ShoppingCartIcon, MinusIcon, PlusIcon, ClockIcon } from "@heroicons/react/24/outline";

const ProductInfo = ({ product, quantity, setQuantity, onAddToCart, isPromoActive, timeLeft }) => {
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8 mt-4 lg:mt-0">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-600 text-white text-[8px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase italic tracking-widest">Premium</span>
          <span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">{product.category?.name}</span>
        </div>
        
        {/* Titre Ultra-Responsive */}
        <h1 className="text-[7vw] sm:text-5xl lg:text-6xl font-[1000] text-gray-900 leading-[1.1] md:leading-[0.9] uppercase tracking-tighter italic">
          {product.name}
        </h1>
      </div>

      {/* Prix & Promo */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl shadow-gray-100 border border-gray-50">
        <div className="flex flex-wrap items-baseline gap-3 md:gap-4">
          <span className={`text-3xl md:text-5xl font-[1000] tracking-tighter ${isPromoActive ? "text-rose-600" : "text-gray-900"}`}>
            {(isPromoActive ? product.finalPrice : product.price)?.toLocaleString()} 
            <span className="text-xs md:text-sm italic ml-1 font-black uppercase">FCFA</span>
          </span>
          {isPromoActive && (
            <span className="text-sm md:text-xl line-through text-gray-300 font-bold decoration-2">
              {product.price?.toLocaleString()}
            </span>
          )}
        </div>
        
        {isPromoActive && timeLeft && (
          <div className="mt-4 flex items-center gap-2 text-rose-600 text-[9px] md:text-[11px] font-black uppercase tracking-widest animate-pulse">
            <ClockIcon className="h-4 w-4" /> Offre se termine : {timeLeft}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 gap-4">
        {!outOfStock && (
          <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl md:rounded-3xl p-1.5 md:p-2">
            <div className="flex items-center">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 md:p-4 hover:bg-white rounded-xl md:rounded-2xl transition-all shadow-sm active:scale-90"><MinusIcon className="h-4 w-4" /></button>
              <span className="w-10 md:w-14 text-center font-black text-lg md:text-2xl">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-3 md:p-4 hover:bg-white rounded-xl md:rounded-2xl transition-all shadow-sm active:scale-90"><PlusIcon className="h-4 w-4" /></button>
            </div>
            
            <div className="pr-4 text-right">
              {lowStock ? (
                <span className="text-[9px] md:text-[10px] font-black text-orange-600 uppercase leading-none block animate-bounce">Vite ! {product.stock} restants</span>
              ) : (
                <span className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">En Stock</span>
              )}
            </div>
          </div>
        )}

        <button
          disabled={outOfStock}
          onClick={() => onAddToCart(product, quantity)}
          className={`w-full py-5 md:py-7 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.15em] text-[10px] md:text-xs flex items-center justify-center gap-3 transition-all ${
            outOfStock ? "bg-gray-200 text-gray-400" : "bg-gray-900 text-white hover:bg-indigo-600 active:scale-95 shadow-lg"
          }`}
        >
          {outOfStock ? "Indisponible" : <><ShoppingCartIcon className="h-4 w-4 md:h-5 md:w-5" /> {lowStock ? "Acheter Maintenant" : "Ajouter au Panier"}</>}
        </button>
      </div>

      {/* Détails */}
      <div className="pt-6 border-t border-gray-100 w-full overflow-hidden">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 italic">
            Notes du designer
        </p>
        <div 
            className="text-gray-500 text-sm leading-relaxed max-w-full break-words prose prose-sm prose-indigo"
            style={{ wordBreak: 'break-word' }} // Sécurité supplémentaire
            dangerouslySetInnerHTML={{ __html: product.description }} 
        />
        </div>
    </div>
  );
};

export default ProductInfo;