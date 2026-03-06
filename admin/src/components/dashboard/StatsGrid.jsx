import { DollarSign, Clock, ShoppingBag, RotateCcw } from "lucide-react";

const Card = ({ title, value, icon: Icon, color, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between min-h-[110px] md:min-h-[150px] ${onClick ? 'cursor-pointer hover:shadow-md transition-all' : ''}`}
  >
    <div className="flex justify-between items-start gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{title}</p>
        <h3 className="text-sm md:text-2xl font-[1000] text-gray-900 tracking-tighter truncate mt-1">{value}</h3>
      </div>
      <div className={`shrink-0 p-2 md:p-4 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={16} className="md:w-6 md:h-6" />
      </div>
    </div>
  </div>
);

export default function StatsGrid({ stats, revenue }) {
  // 1. On récupère le CA. S'il est à 0, c'est que le calcul backend est vide.
  const val = revenue?.validated || 0;
  const pen = revenue?.pending || 0;

  // 2. On récupère le nombre de commandes. 
  // Si ordersCount n'existe pas, on compte les éléments dans la liste latestOrders
  const totalOrders = stats?.ordersCount || stats?.latestOrders?.length || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      <Card 
        title="CA VALIDÉ" 
        value={`${Number(val).toLocaleString()} F`} 
        icon={DollarSign} 
        color="bg-emerald-500" 
      />
      <Card 
        title="EN ATTENTE" 
        value={`${Number(pen).toLocaleString()} F`} 
        icon={Clock} 
        color="bg-amber-500" 
      />
      <Card 
        title="COMMANDES" 
        value={totalOrders} 
        icon={ShoppingBag} 
        color="bg-indigo-500" 
      />
      <Card 
        title="RETOURS" 
        value={stats?.pendingReturns || 0} 
        icon={RotateCcw} 
        color="bg-gray-500" 
      />
    </div>
  );
}