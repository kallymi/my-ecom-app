import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Clock,
  Activity,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axios";

/* =========================
   UI HELPERS & MAPPINGS
========================= */
const statusMap = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  CONFIRMED: "bg-indigo-50 text-indigo-600 border-indigo-100",
  SHIPPING: "bg-blue-50 text-blue-600 border-blue-100",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-600 border-red-100",
  RETURNED: "bg-gray-100 text-gray-600 border-gray-200",
  RETURN_REQUESTED: "bg-orange-50 text-orange-600 border-orange-100 animate-pulse",
};

const DashboardCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div className="space-y-1 md:space-y-2">
        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-xl md:text-2xl font-[900] text-gray-900 tracking-tighter">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
            <ArrowUpRight size={12} /> {trend}%
          </div>
        )}
      </div>
      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={20} className="md:w-6 md:h-6" />
      </div>
    </div>
  </div>
);

/* =========================
   MAIN COMPONENT
========================= */
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState({ validated: 0, pending: 0, averageBasket: 0 });
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/admin/stats");
        if (data.success) {
          setStats(data);
          setRevenue(data.revenue);
        }
      } catch (error) {
        console.error("Erreur dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const res = await api.get("/admin/stats/active-users");
        setOnlineUsers(res.data.activeUsers || 0);
      } catch (err) {
        console.error("Erreur utilisateurs actifs", err);
      }
    };
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-xs uppercase tracking-[0.3em] text-gray-400">Loading Data</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HEADER - Adaptatif */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-[1000] italic tracking-tighter uppercase leading-none">
            Dashboard<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-gray-400 font-medium text-xs md:text-sm mt-2">Vue d'ensemble de votre activité en temps réel.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-1.5 pr-5 rounded-full shadow-sm border border-gray-100 self-end sm:self-auto">
          <div className="relative">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
              <Activity size={18} />
            </div>
            <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-ping"></span>
          </div>
          <div>
            <p className="font-black text-sm leading-none">{onlineUsers} actifs</p>
            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Live Monitor</p>
          </div>
        </div>
      </div>

      {/* 2. KPIs PRINCIPAUX - Grille responsive 2x2 ou 4x1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <DashboardCard title="Chiffre d'Affaire" value={`${revenue.validated?.toLocaleString()} F`} icon={DollarSign} color="bg-emerald-500" trend={12} />
        <DashboardCard title="Encours Client" value={`${revenue.pending?.toLocaleString()} F`} icon={Clock} color="bg-amber-500" />
        <DashboardCard title="Total Commandes" value={stats.ordersCount || stats.orders} icon={ShoppingBag} color="bg-indigo-500" trend={5} />
        
        <div 
          onClick={() => navigate('/admin/returns')}
          className={`cursor-pointer p-5 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border transition-all duration-300 ${
            stats.pendingReturns > 0 
            ? "bg-orange-50 border-orange-200 shadow-md" 
            : "bg-white border-gray-100 opacity-80 hover:opacity-100"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Retours</p>
              <h3 className={`text-xl md:text-2xl font-[900] tracking-tighter text-left ${stats.pendingReturns > 0 ? "text-orange-600" : "text-gray-900"}`}>
                {stats.pendingReturns || 0}
              </h3>
              {stats.pendingReturns > 0 && (
                 <p className="text-[8px] font-black text-orange-500 uppercase animate-pulse">Action Requise</p>
              )}
            </div>
            <div className={`p-3 md:p-4 rounded-xl ${stats.pendingReturns > 0 ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "bg-gray-100 text-gray-400"}`}>
              <RotateCcw size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. GRAPHIQUE & TOP PRODUITS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* COURBE DE CROISSANCE */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="font-black uppercase text-[10px] md:text-xs tracking-[0.2em] text-gray-400">Flux de revenus (7j)</h2>
            <select className="text-[10px] font-black uppercase bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-gray-100 transition-colors">
              <option>Hebdomadaire</option>
              <option>Mensuel</option>
            </select>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 9, fontWeight: 'bold', fill: '#9ca3af'}} 
                  dy={10}
                  hide={window.innerWidth < 640} 
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '12px'}} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP PERFORMERS */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
          <h2 className="font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 mb-8 text-center sm:text-left">Top Performances</h2>
          <div className="space-y-4 md:space-y-6">
            {(stats.topProducts || []).slice(0, 5).map((prod, i) => (
              <div key={i} className="group flex items-center justify-between p-3 md:p-4 hover:bg-indigo-50/50 rounded-2xl transition-colors cursor-default">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-indigo-600 text-xs">
                    {i + 1}
                  </div>
                  <div className="max-w-[120px] sm:max-w-none">
                    <p className="font-black text-[10px] md:text-xs uppercase text-gray-900 truncate">{prod.name}</p>
                    <p className="text-[9px] text-gray-400 font-bold">{prod.category || 'Ventes'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-[10px] md:text-xs">{prod.sales} qty</p>
                  <p className="text-[9px] text-emerald-500 font-bold">Trending</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. DERNIÈRES COMMANDES & ALERTES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* TABLEAU COMMANDES - Scroll horizontal optimisé */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-black uppercase text-[10px] md:text-xs tracking-[0.2em] text-gray-400">Commandes Récentes</h2>
            <button onClick={() => navigate('/admin/orders')} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Voir tout</button>
          </div>
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50/50">
                <tr className="text-[9px] uppercase text-gray-400 font-black">
                  <th className="px-6 py-4 text-left">Ref</th>
                  <th className="px-6 py-4 text-left">Client</th>
                  <th className="px-6 py-4 text-left">Statut</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.latestOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => navigate('/admin/orders')}>
                    <td className="px-6 py-4 font-mono font-black text-[10px] text-indigo-600">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <p className="font-black text-[10px] md:text-xs uppercase leading-tight">{order.shippingAddress?.fullName || "Anonyme"}</p>
                      <p className="text-[9px] text-gray-400 font-bold">{order.shippingAddress?.neighborhood || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase border ${statusMap[order.status] || "bg-gray-100"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 group-hover:translate-x-[-4px] transition-transform">
                        <span className="font-black text-[10px] md:text-xs">{Number(order.totalAmount || 0 ).toLocaleString()} F</span>
                        <ChevronRight size={14} className="text-gray-300" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ALERTES STOCK */}
        <div className="bg-indigo-950 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-white/10 rounded-xl">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <h2 className="font-black uppercase text-[10px] tracking-widest text-white/80">Alertes Stock</h2>
            </div>
            
            <div className="space-y-3">
              {stats.lowStockProducts?.length > 0 ? (
                stats.lowStockProducts.map((prod, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-2xl flex justify-between items-center backdrop-blur-sm">
                    <div className="max-w-[100px] sm:max-w-none">
                      <p className="font-bold text-[10px] md:text-[11px] uppercase truncate">{prod.name}</p>
                      <p className="text-[8px] text-white/40 font-bold uppercase tracking-tighter">Stock Critique</p>
                    </div>
                    <span className="bg-amber-400 text-indigo-950 px-2 py-1 rounded-lg text-[9px] font-black whitespace-nowrap">
                      {prod.stock} unités
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Package size={20} className="text-white/20" />
                  </div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest italic font-black">Inventaire Optimal</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => navigate('/admin/products')}
            className="relative z-10 w-full mt-8 py-4 bg-white text-indigo-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
          >
            Gérer l'inventaire
          </button>
          
          <Package size={180} className="absolute -bottom-16 -right-16 text-white/5 rotate-12 pointer-events-none" />
        </div>

      </div>
    </div>
  );
}