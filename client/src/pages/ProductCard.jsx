import React from "react";
import { Tag } from "lucide-react";

const ProductCard = ({ product, API_URL, navigate }) => {
  /* =============================
      PROMOTION LOGIC (UNIFIÉE)
  ============================= */
  const isPromoActive =
    product?.promotion?.isActive === true &&
    typeof product?.finalPrice === "number";

  /* =============================
      IMAGE RESOLVER (LOCAL + CLOUDINARY)
  ============================= */
  const resolveImage = () => {
    const img =
      product?.images?.find((i) => i.isMain) ||
      product?.images?.[0];

    if (!img?.url) {
      return "https://placehold.co/400x500?text=Produit";
    }

    return img.url.startsWith("http")
      ? img.url
      : `${API_URL}${img.url}`;
  };



  
  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group cursor-pointer"
    >
      {/* =============================
          IMAGE
      ============================= */}
      <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-100 mb-5">

        {isPromoActive && (
          <div className="absolute top-4 right-4 z-10 bg-rose-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
            <Tag size={12} />
            -{product.promotion.discountValue}
            {product.promotion.discountType === "percentage" ? "%" : " FCFA"}
          </div>
        )}

        <img
          src={resolveImage()}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) =>
            (e.currentTarget.src =
              "https://placehold.co/400x500?text=Produit")
          }
        />

        {/* OVERLAY HOVER */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <div className="w-full bg-white py-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest shadow-xl">
            Aperçu rapide
          </div>
        </div>
      </div>

      {/* =============================
          INFOS PRODUIT
      ============================= */}
      <div className="px-2 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            {typeof product.category === "object"
              ? product.category?.name
              : product.category || "Standard"}
          </span>
        </div>

        <h3 className="text-sm font-black uppercase tracking-tighter truncate group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        {/* PRIX */}
        <div className="flex items-center gap-3">
          <span
            className={`text-lg font-black ${
              isPromoActive ? "text-rose-600" : "text-gray-900"
            }`}
          >
            {(isPromoActive ? product.finalPrice : product.price)?.toLocaleString()}{" "}
            FCFA
          </span>

          {isPromoActive && (
            <span className="text-xs font-bold text-gray-300 line-through">
              {product.price?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
