import { AlertTriangle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StockAlerts({ items }) {
  const navigate = useNavigate();
  return (
    <div className="bg-indigo-950 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-white/10 rounded-xl"><AlertTriangle size={20} className="text-amber-400" /></div>
          <h2 className="font-black uppercase text-[10px] tracking-widest text-white/80">Alertes Stock</h2>
        </div>
        <div className="space-y-3">
          {items?.length > 0 ? items.map((prod, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-bold text-[10px] uppercase truncate max-w-[120px]">{prod.name}</p>
                <p className="text-[8px] text-white/40 font-black uppercase">Stock Critique</p>
              </div>
              <span className="bg-amber-400 text-indigo-950 px-2 py-1 rounded-lg text-[9px] font-black">{prod.stock} un.</span>
            </div>
          )) : (
            <p className="text-center text-white/40 text-[10px] font-black uppercase py-10 tracking-widest">Inventaire OK</p>
          )}
        </div>
      </div>
      <button onClick={() => navigate('/admin/products')} className="relative z-10 w-full mt-8 py-4 bg-white text-indigo-950 rounded-2xl font-[1000] text-[10px] uppercase hover:bg-indigo-50 transition-all">
        Gérer l'inventaire
      </button>
      <Package size={180} className="absolute -bottom-16 -right-16 text-white/5 rotate-12 pointer-events-none" />
    </div>
  );
}