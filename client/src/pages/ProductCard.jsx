import React from "react";
import { Tag, ShoppingCart, Eye } from "lucide-react";

const ProductCard = ({ product, API_URL, navigate }) => {
  const isPromoActive =
    product?.promotion?.isActive === true &&
    typeof product?.finalPrice === "number";

  const resolveImage = () => {
    const img =
      product?.images?.find((i) => i.isMain) || product?.images?.[0];
    if (!img?.url) return "https://placehold.co/400x500?text=Produit";
    return img.url.startsWith("http")
      ? img.url
      : `${API_URL}${img.url}`;
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="
        group relative flex flex-col h-full bg-white rounded-[1.75rem]
        overflow-hidden cursor-pointer min-w-0
        transition-all duration-500 ease-out
        hover:-translate-y-1 hover:shadow-2xl
      "
    >
      {/* IMAGE */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F9F9F9] flex items-center justify-center">

        {/* BADGE PROMO */}
        {isPromoActive && (
          <div className="
            absolute top-3 left-3 z-10
            bg-black text-white px-3 py-1 rounded-full
            text-[clamp(0.55rem,2vw,0.7rem)] font-medium uppercase
            flex items-center gap-1 shadow-lg
            transition-all duration-300 group-hover:scale-105
          ">
            <Tag size={12} className="text-rose-500" />
            <span>
              -{product.promotion.value}
              {product.promotion.type === "percentage" ? "%" : " F"}
            </span>
          </div>
        )}

        {/* IMAGE AVEC PARALLAX */}
        <img
          src={resolveImage()}
          alt={product.name}
          className="
            w-full h-full object-contain p-3 md:p-5
            transition-transform duration-[1200ms] ease-out
            group-hover:scale-110 group-hover:-translate-y-1
            will-change-transform
          "
          onError={(e) =>
            (e.currentTarget.src =
              "https://placehold.co/400x500?text=Produit")
          }
        />

        {/* GRADIENT OVERLAY */}
        <div className="
          absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent
          opacity-0 group-hover:opacity-100 transition duration-500
        " />

        {/* QUICK ACTION MOBILE */}
        <div className="absolute bottom-3 right-3 md:hidden">
          <div className="
            bg-white/90 backdrop-blur-md p-2 rounded-xl
            shadow-md border border-gray-100
            active:scale-90 transition
          ">
            <ShoppingCart size={16} />
          </div>
        </div>

        {/* CTA DESKTOP ANIMÉ */}
        <div className="
          absolute inset-0 hidden md:flex items-center justify-center
          opacity-0 group-hover:opacity-100
          transition-all duration-500
        ">
          <button className="
            bg-white text-black px-6 py-3 rounded-full
            text-xs uppercase tracking-wide font-semibold
            flex items-center gap-2 shadow-xl
            translate-y-4 group-hover:translate-y-0
            transition-all duration-500
            hover:bg-black hover:text-white
          ">
            <Eye size={14} /> Voir
          </button>
        </div>
      </div>

      {/* TEXTE */}
      <div className="p-3 md:p-5 flex flex-col flex-grow min-w-0">

        {/* CATÉGORIE */}
        <span className="
          text-[clamp(0.55rem,2vw,0.7rem)]
          uppercase tracking-wide text-gray-400
          truncate
        ">
          {typeof product.category === "object"
            ? product.category?.name
            : product.category || "Collection"}
        </span>

        {/* NOM */}
        <h3 className="
          text-[clamp(0.85rem,2.5vw,1.05rem)]
          font-semibold text-gray-900
          leading-tight mt-1 mb-2
          line-clamp-2 break-words
          transition-colors duration-300
          group-hover:text-indigo-600
        ">
          {product.name}
        </h3>

        {/* PRIX */}
        <div className="mt-auto flex items-baseline gap-2 flex-wrap">

          <span
            className={`
              text-[clamp(1rem,3vw,1.2rem)]
              font-semibold tracking-tight
              transition-all duration-300
              ${isPromoActive ? "text-rose-600" : "text-black"}
            `}
          >
            {(isPromoActive
              ? product.finalPrice
              : product.price
            )?.toLocaleString()}
            <span className="text-[0.65em] ml-1 font-medium">CFA</span>
          </span>

          {isPromoActive && (
            <span className="
              text-[clamp(0.7rem,2vw,0.85rem)]
              text-gray-400 line-through
            ">
              {product.price?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;