import React from "react";
import { Tag, ShoppingCart, Eye } from "lucide-react";

const ProductCard = ({ product, API_URL, navigate }) => {
  const isPromoActive =
    product?.promotion?.isActive === true &&
    typeof product?.finalPrice === "number";

  const resolveImage = () => {
    const img = product?.images?.find((i) => i.isMain) || product?.images?.[0];
    if (!img?.url) return "https://placehold.co/400x500?text=Produit";
    return img.url.startsWith("http") ? img.url : `${API_URL}${img.url}`;
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group relative flex flex-col h-full bg-white rounded-[1.5rem] overflow-hidden transition-all duration-500 hover:shadow-xl border border-transparent hover:border-gray-100 cursor-pointer"
    >
      {/* CONTENEUR IMAGE - Ratio plus contrôlé */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F9F9F9] flex items-center justify-center">
        
        {/* Badge Promo - Plus petit sur mobile */}
        {isPromoActive && (
          <div className="absolute top-2 left-2 z-10 bg-black text-white px-2 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase flex items-center gap-1 shadow-xl">
            <Tag size={8} className="text-rose-500" />
            <span>-{product.promotion.value}{product.promotion.type === "percentage" ? "%" : " F"}</span>
          </div>
        )}

        {/* IMAGE : Changement vers object-contain pour éviter l'effet "trop gros" */}
        <img
          src={resolveImage()}
          alt={product.name}
          className="w-full h-full object-contain p-2 md:p-4 transition-transform duration-[1.5s] group-hover:scale-110"
          onError={(e) => (e.currentTarget.src = "https://placehold.co/400x500?text=Produit")}
        />

        {/* Quick Add Mobile - Plus discret */}
        <div className="absolute bottom-2 right-2 md:hidden">
            <div className="bg-white/80 backdrop-blur-md p-2 rounded-lg shadow-sm text-black border border-gray-100">
                <ShoppingCart size={14} />
            </div>
        </div>

        {/* Overlay Desktop (inchangé) */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center translate-y-4 group-hover:translate-y-0">
          <button className="bg-white text-black px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:bg-black hover:text-white transition-colors">
            <Eye size={14} /> Voir
          </button>
        </div>
      </div>

      {/* CONTENU TEXTE - Padding réduit sur mobile (p-3 au lieu de p-4) */}
      <div className="p-3 md:p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-300">
            {typeof product.category === "object" ? product.category?.name : product.category || "Collection"}
          </span>
        </div>

        {/* Titre - Texte plus petit sur mobile (text-xs) */}
        <h3 className="text-[11px] md:text-sm font-black text-gray-900 line-clamp-1 leading-tight mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
          {product.name}
        </h3>

        {/* PRIX */}
        <div className="mt-auto flex items-baseline gap-2">
            <span className={`text-sm md:text-base font-[1000] tracking-tighter ${isPromoActive ? "text-rose-600" : "text-black"}`}>
              {(isPromoActive ? product.finalPrice : product.price)?.toLocaleString()} 
              <span className="text-[8px] ml-0.5 font-bold italic">CFA</span>
            </span>
            {isPromoActive && (
              <span className="text-[9px] font-bold text-gray-300 line-through">
                {product.price?.toLocaleString()}
              </span>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;