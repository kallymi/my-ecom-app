import { useEffect, useState, useCallback } from "react";
import api from "../../api/axios";
import { Activity } from "lucide-react";

// Import des segments
import StatsGrid from "../../components/dashboard/StatsGrid";
import RevenueChart from "../../components/dashboard/RevenueChart";
import TopProducts from "../../components/dashboard/TopProducts";
import RecentOrders from "../../components/dashboard/RecentOrders";
import StockAlerts from "../../components/dashboard/StockAlerts";

export default function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState({ validated: 0, pending: 0 });
  const [onlineUsers, setOnlineUsers] = useState(0);

  /**
   * 1. Fonction pour récupérer les données du graphique uniquement
   * Utilisée lors du changement de période (Semaine/Mois)
   */
  const fetchAnalytics = useCallback(async (selectedPeriod = "week") => {
    try {
      const { data } = await api.get(`/orders/analytics?period=${selectedPeriod}`);
      // On s'assure que data est bien un tableau
      setChartData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur lors de la récupération des analytics:", err);
    }
  }, []);

  /**
   * 2. Chargement initial du Dashboard
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/admin/stats");
        
        if (data.success) {
          setStats(data);
          setRevenue(data.revenue || { validated: 0, pending: 0 });
          
          // On initialise le graphique avec la semaine par défaut
          // Si le backend envoie déjà chartData dans /admin/stats, on l'utilise, sinon on fetch
          if (data.chartData && data.chartData.length > 0) {
            setChartData(data.chartData);
          } else {
            await fetchAnalytics("week");
          }
        }
      } catch (error) {
        console.error("Erreur globale Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [fetchAnalytics]);

  /**
   * 3. Surveillance des utilisateurs en ligne (toutes les 30s)
   */
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const res = await api.get("/admin/stats/active-users");
        setOnlineUsers(res.data.activeUsers || 0);
      } catch (err) {
        console.error("Erreur users actifs:", err);
      }
    };

    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  // Écran de chargement
  if (loading || !stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-xs uppercase tracking-[0.3em] text-gray-400">Syncing Data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-[1000] italic tracking-tighter uppercase leading-none">
            Dashboard<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-gray-400 font-medium text-xs md:text-sm mt-2">Activité en temps réel.</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-1.5 pr-5 rounded-full shadow-sm border border-gray-100">
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

      {/* SEGMENT 1 : LES KPIS (Ventes, Commandes, Clients) */}
      <StatsGrid stats={stats} revenue={revenue} />

      {/* SEGMENT 2 : GRAPHIQUE DE REVENUS & TOP PRODUITS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <RevenueChart 
            // On priorise chartData (mis à jour par les boutons) sinon on prend le backup des stats
            data={chartData.length > 0 ? chartData : (stats.chartData || [])} 
            // Déclenche fetchAnalytics avec la période choisie (week/month)
            onPeriodChange={(p) => fetchAnalytics(p)} 
          />
        </div>
        <TopProducts products={stats.topProducts} />
      </div>

      {/* SEGMENT 3 : DERNIÈRES COMMANDES & ALERTES STOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <RecentOrders orders={stats.latestOrders} />
        </div>
        <StockAlerts items={stats.lowStockProducts} />
      </div>

    </div>
  );
}