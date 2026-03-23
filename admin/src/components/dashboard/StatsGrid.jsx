import { memo, useMemo } from "react";
import { DollarSign, Clock, ShoppingBag, RotateCcw, AlertCircle } from "lucide-react";

/* ================================
   CARD COMPONENT (Optimisé)
================================ */
const Card = memo(function Card({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between min-h-[110px] md:min-h-[150px]">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
            {title}
          </p>
          <h3 className="text-sm md:text-2xl font-[1000] text-gray-900 tracking-tighter truncate mt-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-[7px] md:text-[9px] font-bold text-indigo-500 mt-1 uppercase italic">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`shrink-0 p-2 md:p-4 rounded-xl ${color.bg} ${color.text}`}>
          <Icon size={16} className="md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
});

/* ================================
   STATS GRID (Fidèle au Backend)
================================ */
export default function StatsGrid({ stats, revenue }) {
  const data = useMemo(() => {
    // Mapping fidèle des données backend
    const validatedRevenue = Number(revenue?.validated ?? 0);
    const pendingRevenue = Number(revenue?.pending ?? 0);
    
    const totalOrders = stats?.counts?.orders ?? 0;
    const todayOrders = stats?.todayOrderCount ?? 0;
    const toProcess = stats?.pendingProcessingCount ?? 0;
    const returns = stats?.pendingReturns ?? 0;

    return [
      {
        title: "CA VALIDÉ",
        value: `${validatedRevenue.toLocaleString('fr-FR')} F`,
        subtitle: "CA définitif",
        icon: DollarSign,
        color: { bg: "bg-emerald-100", text: "text-emerald-600" }
      },
      {
        title: "À TRAITER",
        value: toProcess.toLocaleString(),
        subtitle: `${pendingRevenue.toLocaleString('fr-FR')} F en attente`,
        icon: Clock,
        color: { bg: "bg-amber-100", text: "text-amber-600" }
      },
      {
        title: "COMMANDES DU JOUR",
        value: todayOrders.toLocaleString(),
        subtitle: `Total: ${totalOrders.toLocaleString()}`,
        icon: ShoppingBag,
        color: { bg: "bg-indigo-100", text: "text-indigo-600" }
      },
      {
        title: "RETOURS",
        value: returns.toLocaleString(),
        subtitle: "Demandes actives",
        icon: RotateCcw,
        color: returns > 0 
          ? { bg: "bg-red-100", text: "text-red-600" } 
          : { bg: "bg-gray-100", text: "text-gray-600" }
      }
    ];
  }, [stats, revenue]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {data.map((card) => (
        <Card key={card.title} {...card} />
      ))}
    </div>
  );
}