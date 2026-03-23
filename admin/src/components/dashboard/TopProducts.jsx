import { memo, useMemo } from "react";

const ProductItem = memo(function ProductItem({ product, index }) {

  const rank = index + 1;

  return (
    <div
      className="group flex items-center justify-between p-3 md:p-4 hover:bg-indigo-50/50 rounded-2xl transition-colors border border-transparent hover:border-indigo-100"
    >
      <div className="flex items-center gap-3 md:gap-4">

        {/* Rank */}
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-indigo-600 text-xs shadow-inner">
          {rank}
        </div>

        {/* Product Info */}
        <div className="max-w-[140px] sm:max-w-none min-w-0">

          <p className="font-black text-[10px] md:text-xs uppercase text-gray-900 truncate">
            {product?.name || "Produit"}
          </p>

          <p className="text-[9px] text-gray-400 font-bold truncate">
            {product?.category || "Ventes"}
          </p>

        </div>

      </div>

      {/* Sales */}
      <div className="text-right">

        <p className="font-black text-[10px] md:text-xs text-gray-900">
          {product?.sales ?? 0} qty
        </p>

        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">
          Trending
        </p>

      </div>

    </div>
  );
});


export default function TopProducts({ products = [] }) {

  const topProducts = useMemo(() => {
    return products.slice(0, 5);
  }, [products]);

  const hasProducts = topProducts.length > 0;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">

      {/* Header */}
      <h2 className="font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 mb-8 text-center sm:text-left">
        Top Performances
      </h2>

      {/* Products */}
      <div className="space-y-4 md:space-y-6">

        {hasProducts ? (

          topProducts.map((product, index) => (
            <ProductItem
              key={product._id || product.id || index}
              product={product}
              index={index}
            />
          ))

        ) : (

          <p className="text-center text-gray-300 text-[10px] font-black uppercase py-10">
            Aucune donnée
          </p>

        )}

      </div>

    </div>
  );
}