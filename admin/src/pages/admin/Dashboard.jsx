import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Clock,
  Activity,
  Zap,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  RotateCcw,
  ArrowRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import api from "../../api/axios";

/* =========================
   UI HELPERS & MAPPINGS
========================= */
const statusMap = {
  PENDING: "bg-amber-50 text-amber-600 border border-amber-100",
  CONFIRMED: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  SHIPPING: "bg-blue-50 text-blue-600 border border-blue-100",
  DELIVERED: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  CANCELLED: "bg-red-50 text-red-600 border border-red-100",
  RETURNED: "bg-gray-100 text-gray-600 border border-gray-200",
  RETURN_REQUESTED: "bg-orange-50 text-orange-600 border border-orange-100 animate-pulse",
};

const DashboardCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-[900] text-gray-900 tracking-tighter">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
            <ArrowUpRight size={12} /> {trend}% ce mois
          </div>
        )}
      </div>
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} />
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
          // On met à jour les stats et les revenus d'un coup
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
      // Assure-toi que cette route correspond à celle définie dans ton backend
      const res = await api.get("/admin/stats/active-users"); 
      setOnlineUsers(res.data.activeUsers || 0);
    } catch (err) {
      console.error("Erreur lors du comptage des utilisateurs actifs", err);
    }
  };

  // On l'exécute immédiatement au chargement
  fetchActiveUsers();

  // On crée un intervalle pour rafraîchir toutes les 30 secondes
  const interval = setInterval(fetchActiveUsers, 30000);

  // Nettoyage de l'intervalle si on quitte la page
  return () => clearInterval(interval);
}, []);

  if (loading || !stats) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-xs uppercase tracking-widest text-gray-400">Synchronisation des données...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* 1. HEADER DYNAMIQUE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase">
            Dashboard<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-gray-400 font-medium text-sm">Bienvenue, voici l'état de votre commerce aujourd'hui.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-full shadow-sm border border-gray-100">
          <div className="relative">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center">
              <Activity size={18} />
            </div>
            <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-ping"></span>
          </div>
          <div>
            <p className="font-black text-sm">{onlineUsers} actifs</p>
            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Live Monitor</p>
          </div>
        </div>
      </div>

      {/* 2. KPIs PRINCIPAUX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Chiffre d'Affaire" value={`${revenue.validated?.toLocaleString()} F`} icon={DollarSign} color="bg-emerald-500" trend={12} />
        <DashboardCard title="Encours Client" value={`${revenue.pending?.toLocaleString()} F`} icon={Clock} color="bg-amber-500" />
        <DashboardCard title="Total Commandes" value={stats.ordersCount || stats.orders} icon={ShoppingBag} color="bg-indigo-500" trend={5} />
        

        {/* CARTE RETOURS - Dynamique */}
        <div 
          onClick={() => navigate('/admin/returns')}
          className={`cursor-pointer p-6 rounded-[2.5rem] border transition-all duration-500 ${
            stats.pendingReturns > 0 
            ? "bg-orange-50 border-orange-200 shadow-lg shadow-orange-100/50" 
            : "bg-white border-gray-100 opacity-60 hover:opacity-100"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Retours</p>
              <h3 className={`text-2xl font-[900] tracking-tighter text-left ${stats.pendingReturns > 0 ? "text-orange-600" : "text-gray-900"}`}>
                {stats.pendingReturns || 0}
              </h3>
              {stats.pendingReturns > 0 && (
                 <p className="text-[9px] font-black text-orange-500 uppercase animate-pulse">Action Requise</p>
              )}
            </div>
            <div className={`p-4 rounded-2xl ${stats.pendingReturns > 0 ? "bg-orange-500 text-white shadow-lg shadow-orange-200" : "bg-gray-100 text-gray-400"}`}>
              <RotateCcw size={24} />
            </div>
          </div>
        </div>
        
        <DashboardCard title="Panier Moyen" value={`${revenue.averageBasket?.toLocaleString()} F`} icon={TrendingUp} color="bg-violet-500" />
      </div>

      {/* 3. GRAPHIQUE & TOP PRODUITS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COURBE DE CROISSANCE */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-black uppercase text-xs tracking-[0.2em] text-gray-400">Flux de revenus (7 derniers jours)</h2>
            <select className="text-[10px] font-black uppercase bg-gray-50 border-none rounded-lg px-3 py-1 outline-none cursor-pointer">
              <option>Hebdomadaire</option>
              <option>Mensuel</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.1} />
                    <stop offset="95%" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9ca3af'}} dy={10} />
                <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP PERFORMERS */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
          <h2 className="font-black uppercase text-xs tracking-[0.2em] text-gray-400 mb-8 text-center">Top Performances</h2>
          <div className="space-y-6">
            {(stats.topProducts || []).map((prod, i) => (
              <div key={i} className="group flex items-center justify-between p-4 hover:bg-indigo-50/50 rounded-2xl transition-colors cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-indigo-600">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase text-gray-900 line-clamp-1">{prod.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{prod.category || 'Électronique'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs">{prod.sales} Ventes</p>
                  <p className="text-[9px] text-emerald-500 font-bold">+{Math.floor(Math.random() * 20)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. DERNIÈRES COMMANDES & ALERTES STOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TABLEAU COMMANDES */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-black uppercase text-xs tracking-[0.2em] text-gray-400">Commandes Récentes</h2>
            <button onClick={() => navigate('/admin/orders')} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr className="text-[9px] uppercase text-gray-400 font-black">
                  <th className="p-6 text-left">Ref</th>
                  <th className="p-6 text-left">Client</th>
                  <th className="p-6 text-left">Statut</th>
                  <th className="p-6 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.latestOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => navigate('/admin/orders')}>
                    <td className="p-6 font-mono font-black text-xs text-indigo-600">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="p-6">
                      <p className="font-black text-xs uppercase">{order.shippingAddress?.fullName || "Anonyme"}</p>
                      <p className="text-[9px] text-gray-400 font-bold">{order.shippingAddress?.neighborhood || "N/A"}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${statusMap[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 group-hover:translate-x-[-4px] transition-transform">
                        <span className="font-black text-xs">{Number(order.totalAmount || 0 ).toLocaleString()} F</span>
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
        <div className="bg-indigo-900 rounded-[3rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-white/10 rounded-xl">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <h2 className="font-black uppercase text-xs tracking-widest">Alertes Inventaire</h2>
            </div>
            
            <div className="space-y-4">
              {stats.lowStockProducts?.length > 0 ? (
                stats.lowStockProducts.map((prod, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[11px] uppercase truncate w-32">{prod.name}</p>
                      <p className="text-[9px] text-white/50 font-bold">STOCK CRITIQUE</p>
                    </div>
                    <span className="bg-amber-400 text-indigo-950 px-3 py-1 rounded-full text-[10px] font-black">
                      {prod.stock} Restants
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-white/40 text-xs font-bold uppercase italic">Tout est en stock ✓</p>
              )}
            </div>

            <button 
              onClick={() => navigate('/admin/products')}
              className="w-full mt-8 py-4 bg-white text-indigo-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Gérer l'inventaire
            </button>
          </div>
          
          {/* Déco fond */}
          <Package size={150} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
        </div>

      </div>
    </div>
  );
}