import React, { useState, useEffect } from "react";
import {
  MinusIcon,
  PlusIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  ClockIcon, // Ajout de l'icône horloge
} from "@heroicons/react/24/outline";

const ProductInfo = ({
  product,
  quantity,
  setQuantity,
  onAddToCart,
  onDirectBuy,
  isPromoActive,
}) => {
  const [timeLeft, setTimeLeft] = useState({ d: "00", h: "00", m: "00", s: "00" });

  useEffect(() => {
    const targetDate = product.promotion?.endDate;
    if (!isPromoActive || !targetDate) return;

    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ d: "00", h: "00", m: "00", s: "00" });

      setTimeLeft({
        d: String(Math.floor(diff / 864e5)).padStart(2, "0"),
        h: String(Math.floor((diff / 36e5) % 24)).padStart(2, "0"),
        m: String(Math.floor((diff / 6e4) % 60)).padStart(2, "0"),
        s: String(Math.floor((diff / 1e3) % 60)).padStart(2, "0"),
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [product.promotion?.endDate, isPromoActive]);

  const outOfStock = product.stock <= 0;

  const handleWhatsAppOrder = () => {
    const message = `Bonjour, je souhaite commander : \n*${product.name}*\nQté : ${quantity}\nPrix total : ${(isPromoActive ? product.finalPrice : product.price) * quantity} F\nLien : ${window.location.href}`;
    const phoneNumber = "235XXXXXXXXX"; 
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // Petit composant interne pour les cases du chrono
  const TimerUnit = ({ value, label }) => (
    <div className="flex flex-col items-center px-2">
      <span className="text-lg font-black text-rose-600 leading-none">{value}</span>
      <span className="text-[7px] uppercase font-bold text-rose-400 tracking-tighter mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      
      {/* HEADER */}
      <div className="space-y-2 min-w-0">
        <span className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">
          {product.category?.name || "Nouveauté"}
        </span>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight break-words overflow-wrap-anywhere">
          {product.name}
        </h1>
      </div>

      {/* BLOC PRIX ET CHRONO PROMO */}
      <div className={`relative p-5 rounded-[2.5rem] border-2 transition-all duration-500 ${isPromoActive ? "border-rose-500 bg-rose-50/30" : "border-slate-100 bg-slate-50/50"}`}>
        
        {/* Badge OFF (en haut à droite) */}
        {isPromoActive && (
          <div className="absolute -top-3 -right-2 bg-rose-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-rose-200 rotate-3">
             PROMO FLASH
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Prix */}
          <div className="flex flex-wrap items-baseline gap-3">
            <span className={`text-3xl md:text-4xl font-black ${isPromoActive ? "text-rose-600" : "text-slate-900"}`}>
              {(isPromoActive ? product.finalPrice : product.price)?.toLocaleString()} <span className="text-lg">F</span>
            </span>
            {isPromoActive && (
              <span className="text-lg text-slate-400 line-through font-medium italic">
                {product.price?.toLocaleString()} F
              </span>
            )}
          </div>

          {/* Chronomètre (Affiché seulement si promo active) */}
          {isPromoActive && (
            <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-rose-100">
              <ClockIcon className="h-4 w-4 text-rose-500 mr-1 animate-pulse" />
              <TimerUnit value={timeLeft.d} label="Jours" />
              <span className="font-black text-rose-300 mb-2">:</span>
              <TimerUnit value={timeLeft.h} label="Heures" />
              <span className="font-black text-rose-300 mb-2">:</span>
              <TimerUnit value={timeLeft.m} label="Min" />
              <span className="font-black text-rose-300 mb-2">:</span>
              <TimerUnit value={timeLeft.s} label="Sec" />
            </div>
          )}
        </div>
      </div>

      {/* ACTIONS COMPLÈTES */}
      <div className="space-y-3">
        {/* 1. SÉLECTEUR DE QUANTITÉ AVEC STOCK DYNAMIQUE */}
        {!outOfStock && (
          <div className="flex items-center justify-between p-1.5 bg-slate-100 rounded-full border border-slate-200/50">
            <div className="flex items-center gap-1">
              {/* Bouton Moins */}
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-90 transition-all text-slate-600"
              >
                <MinusIcon className="h-4 w-4 stroke-[3]" />
              </button>

              {/* Chiffre Quantité */}
              <span className="w-10 text-center font-black text-slate-800 text-sm">{quantity}</span>

              {/* Bouton Plus */}
              <button 
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} 
                className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-90 transition-all text-slate-600"
              >
                <PlusIcon className="h-4 w-4 stroke-[3]" />
              </button>

              {/* INDICATEUR DE STOCK (NOUVEAU) */}
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-slate-200">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  product.stock < 5 ? "bg-orange-500" : "bg-emerald-500"
                }`} />
                <span className={`text-[10px] font-black uppercase tracking-tight ${
                  product.stock < 5 ? "text-orange-600" : "text-emerald-600"
                }`}>
                  {product.stock < 5 ? `Seulement ${product.stock} restants !` : "En stock"}
                </span>
              </div>
            </div>

            {/* Label Quantité à droite */}
            <span className="pr-4 text-[9px] font-black uppercase text-slate-400 tracking-widest hidden sm:block">
              Quantité
            </span>
          </div>
        )}

        {/* BOUTONS D'ACHAT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            disabled={outOfStock}
            onClick={() => onAddToCart && onAddToCart(product, quantity)}
            className="group flex-1 py-4 rounded-full border-2 border-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all active:scale-95 disabled:opacity-30"
          >
            <ShoppingBagIcon className="h-4 w-4" />
            Au Panier
          </button>

          <button
            disabled={outOfStock}
            onClick={() => onDirectBuy && onDirectBuy(product, quantity)}
            className="group flex-1 py-4 rounded-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-30"
          >
            <BoltIcon className="h-4 w-4 text-yellow-400 group-hover:animate-pulse" />
            Acheter Direct
          </button>
        </div>

        {!outOfStock && (
          <button
            onClick={handleWhatsAppOrder}
            className="w-full py-4 rounded-full bg-[#25D366] text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all shadow-md active:scale-95"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            Commander via WhatsApp
          </button>
        )}
      </div>

      {/* DESCRIPTION AVEC TYPOGRAPHY */}
      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4">Détails</h3>
        <div
          className="prose prose-slate max-w-full text-slate-600 leading-relaxed text-[0.9rem] break-words overflow-wrap-anywhere prose-p:my-2 prose-ul:list-disc prose-li:ml-4"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </div>
    </div>
  );
};

export default ProductInfo;