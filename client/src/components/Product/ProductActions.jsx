import React from "react";
import { 
  BoltIcon, 
  ChatBubbleLeftRightIcon,
  MinusIcon,
  PlusIcon 
} from "@heroicons/react/24/outline";

const ProductActions = ({ product, quantity, setQuantity, onDirectBuy, outOfStock }) => {
  
  // Fonction pour générer le lien WhatsApp
  const handleWhatsAppOrder = () => {
    const message = `Bonjour, je souhaite commander le produit suivant : 
*${product.name}*
Quantité : ${quantity}
Prix total : ${(product.finalPrice || product.price) * quantity} F
Lien : ${window.location.href}`;
    
    const phoneNumber = "23566268256"; 
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-4 w-full pt-4">
      
      {/* 1. SÉLECTEUR DE QUANTITÉ AVEC INDICATEUR DE STOCK */}
      {!outOfStock && (
        <div className="flex items-center justify-between p-1.5 bg-slate-100 rounded-[2rem] border border-slate-200/50 mb-2">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-indigo-600 transition-all active:scale-90"
            >
              <MinusIcon className="h-4 w-4 stroke-[3]" />
            </button>
            
            <span className="w-14 text-center font-black text-slate-900 text-lg">{quantity}</span>
            
            <button 
              onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-indigo-600 transition-all active:scale-90"
            >
              <PlusIcon className="h-4 w-4 stroke-[3]" />
            </button>

            {/* INDICATEUR DE STOCK DYNAMIQUE */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                product.stock < 5 ? "bg-orange-500" : "bg-emerald-500"
              }`} />
              <span className={`text-[10px] font-black uppercase tracking-tight ${
                product.stock < 5 ? "text-orange-600" : "text-emerald-600"
              }`}>
                {product.stock < 5 ? `Seulement ${product.stock} !` : "En stock"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. BOUTON ACHAT DIRECT (Checkout Rapide) */}
      <button
        disabled={outOfStock}
        onClick={() => onDirectBuy(product, quantity)}
        className={`group w-full py-5 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 ${
          outOfStock
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-slate-950 text-white hover:bg-black hover:scale-[1.02] active:scale-95"
        }`}
      >
        <BoltIcon className="h-5 w-5 text-yellow-400 group-hover:animate-pulse" />
        {outOfStock ? "Produit épuisé" : "Acheter maintenant"}
      </button>

      {/* 3. BOUTON WHATSAPP */}
      {!outOfStock && (
        <button
          onClick={handleWhatsAppOrder}
          className="w-full py-5 rounded-[2.5rem] bg-[#25D366] text-white font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all hover:bg-[#128C7E] hover:scale-[1.02] active:scale-95 shadow-xl shadow-green-100 border-b-4 border-black/10"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          Commander par WhatsApp
        </button>
      )}

      <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-2">
        Paiement à la livraison • Livraison rapide
      </p>
    </div>
  );
};

export default ProductActions;