import { memo } from "react";
import { AlertTriangle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StockItem = memo(function StockItem({ product }) {
  return (
    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex justify-between items-center hover:bg-white/10 transition">
      
      <div className="min-w-0">
        <p className="font-bold text-[10px] uppercase truncate max-w-[140px]">
          {product?.name || "Produit"}
        </p>

        <p className="text-[8px] text-white/40 font-black uppercase">
          Stock critique
        </p>
      </div>

      <span className="bg-amber-400 text-indigo-950 px-2 py-1 rounded-lg text-[9px] font-black">
        {product?.stock ?? 0} un.
      </span>

    </div>
  );
});


export default function StockAlerts({ items = [] }) {

  const navigate = useNavigate();

  const hasAlerts = items.length > 0;

  return (
    <div className="bg-indigo-950 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">

      <div className="relative z-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">

          <div className="p-2 bg-white/10 rounded-xl">
            <AlertTriangle size={20} className="text-amber-400" />
          </div>

          <h2 className="font-black uppercase text-[10px] tracking-widest text-white/80">
            Alertes Stock
          </h2>

          {hasAlerts && (
            <span className="ml-auto text-[9px] bg-amber-400 text-indigo-950 px-2 py-1 rounded-lg font-black">
              {items.length}
            </span>
          )}

        </div>

        {/* Stock List */}
        <div className="space-y-3 max-h-[260px] overflow-auto pr-1">

          {hasAlerts ? (
            items.map((product) => (
              <StockItem
                key={product._id || product.id}
                product={product}
              />
            ))
          ) : (
            <p className="text-center text-white/40 text-[10px] font-black uppercase py-10 tracking-widest">
              Inventaire OK
            </p>
          )}

        </div>

      </div>

      {/* Button */}
      <button
        onClick={() => navigate("/admin/products")}
        className="relative z-10 w-full mt-8 py-4 bg-white text-indigo-950 rounded-2xl font-[1000] text-[10px] uppercase hover:bg-indigo-50 transition-all active:scale-95"
      >
        Gérer l'inventaire
      </button>

      {/* Decorative icon */}
      <Package
        size={180}
        className="absolute -bottom-16 -right-16 text-white/5 rotate-12 pointer-events-none"
      />

    </div>
  );
}