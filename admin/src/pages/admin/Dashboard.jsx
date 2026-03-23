import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api/axios";
import { Activity } from "lucide-react";

import StatsGrid from "../../components/dashboard/StatsGrid";
import RevenueChart from "../../components/dashboard/RevenueChart";
import TopProducts from "../../components/dashboard/TopProducts";
import RecentOrders from "../../components/dashboard/RecentOrders";
import StockAlerts from "../../components/dashboard/StockAlerts";

export default function Dashboard() {

  /* ================================
      STATES
  ================================= */

  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [revenue, setRevenue] = useState({ validated: 0, pending: 0 });

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState(0);
  const [error, setError] = useState(null);

  /* ================================
      FETCH ANALYTICS
  ================================= */

  const fetchAnalytics = useCallback(async (period = "week") => {

    try {

      setLoadingChart(true);

      const { data } = await api.get(`/admin/orders/analytics?period=${period}`);

      if (data?.success) {
        setChartData(Array.isArray(data.chartData) ? data.chartData : []);
      }

    } catch (err) {

      console.error("Erreur analytics:", err);
      setChartData([]);

    } finally {

      setLoadingChart(false);

    }

  }, []);

  /* ================================
      INITIAL DASHBOARD LOAD
  ================================= */

  useEffect(() => {

    let mounted = true;

    const fetchDashboard = async () => {

      try {

        setLoadingPage(true);

        const { data } = await api.get("/admin/stats");

        if (!mounted) return;

        if (data?.success) {

          setStats(data);

          setRevenue(data.revenue || { validated: 0, pending: 0 });

          if (Array.isArray(data.chartData)) {
            setChartData(data.chartData);
          }

        }

      } catch (err) {

        console.error("Erreur Dashboard:", err);

        if (mounted) setError("Impossible de charger le dashboard");

      } finally {

        if (mounted) setLoadingPage(false);

      }

    };

    fetchDashboard();

    return () => { mounted = false };

  }, []);

  /* ================================
      ACTIVE USERS POLLING
  ================================= */

  useEffect(() => {

    let mounted = true;

    const fetchActiveUsers = async () => {

      try {

        const res = await api.get("/admin/stats/active-users");

        if (mounted) {
          setOnlineUsers(res.data?.activeUsers || 0);
        }

      } catch (err) {

        console.error("Erreur active users:", err);

      }

    };

    fetchActiveUsers();

    const interval = setInterval(fetchActiveUsers, 30000);

    return () => {

      mounted = false;
      clearInterval(interval);

    };

  }, []);

  /* ================================
      AUTO REFRESH DASHBOARD
  ================================= */

  useEffect(() => {

    const interval = setInterval(async () => {

      try {

        const { data } = await api.get("/admin/stats");

        if (data?.success) {
          setStats(data);
          setRevenue(data.revenue || { validated: 0, pending: 0 });
        }

      } catch (err) {

        console.error("Auto refresh error:", err);

      }

    }, 60000); // refresh every minute

    return () => clearInterval(interval);

  }, []);

  /* ================================
      MEMOIZED CHART DATA
  ================================= */

  const revenueChartData = useMemo(() => {

    if (chartData.length > 0) return chartData;

    return stats?.chartData || [];

  }, [chartData, stats]);

  /* ================================
      GLOBAL LOADING
  ================================= */

  if (loadingPage) {

    return (

      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">

        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>

        <p className="font-black text-xs uppercase tracking-[0.3em] text-gray-400">
          Syncing Data...
        </p>

      </div>

    );

  }

  if (error) {

    return (

      <div className="min-h-screen flex items-center justify-center text-center">

        <div>

          <h2 className="text-lg font-black text-gray-900 mb-2">
            Erreur Dashboard
          </h2>

          <p className="text-gray-500 text-sm">
            {error}
          </p>

        </div>

      </div>

    );

  }

  /* ================================
      RENDER
  ================================= */

  return (

    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-10 animate-in fade-in duration-700">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">

        <div>

          <h1 className="text-2xl lg:text-5xl font-[1000] italic tracking-tighter uppercase leading-none">
            Dashboard<span className="text-indigo-600">.</span>
          </h1>

          <p className="text-gray-400 font-medium text-xs md:text-sm mt-2">
            Activité en temps réel
          </p>

        </div>

        <div className="flex items-center gap-4 bg-white p-1.5 pr-5 rounded-full shadow-sm border border-gray-100">

          <div className="relative">

            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100">
              <Activity size={16} />
            </div>

            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-ping"></span>

          </div>

          <div>

            <p className="font-black text-xs lg:text-sm leading-none">
              {onlineUsers} actifs
            </p>

            <p className="text-[8px] text-gray-400 uppercase font-bold tracking-tighter">
              Live Monitor
            </p>

          </div>

        </div>

      </div>

      {/* KPI */}

      <StatsGrid stats={stats} revenue={revenue} />
      {/* Dashboard.jsx - Juste après <StatsGrid /> */}
      <div className="bg-indigo-900 text-white p-6 rounded-[2rem] flex flex-wrap gap-8 items-center justify-between border border-indigo-800 shadow-xl shadow-indigo-950/20">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Aujourd'hui</span>
          <span className="text-2xl font-[1000] italic">+{stats?.todayRevenue?.toLocaleString()} F</span>
        </div>
        
        <div className="h-10 w-[1px] bg-indigo-800 hidden md:block" />

        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-indigo-300 uppercase italic">Livraisons prévues</span>
            <span className="font-black">{stats?.expectedDeliveries || 0}</span>
          </div>
          <div className="flex flex-col border-l border-indigo-800 pl-4">
            <span className="text-[9px] font-bold text-indigo-300 uppercase italic">Nouveaux Clients</span>
            <span className="font-black">{stats?.newClientsToday || 0}</span>
          </div>
        </div>

        <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl text-[10px] font-[1000] uppercase tracking-widest hover:bg-indigo-50 transition-colors">
          Imprimer Rapport
        </button>
      </div>

      {/* CHART + PRODUCTS */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        <div className="lg:col-span-2">

          <RevenueChart
            data={revenueChartData}
            onPeriodChange={fetchAnalytics}
            loading={loadingChart}
          />

        </div>

        <TopProducts products={stats?.topProducts || []} />

      </div>

      {/* ORDERS + STOCK */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        <div className="lg:col-span-2">
          <RecentOrders orders={stats?.latestOrders || []} />
        </div>

        <StockAlerts items={stats?.lowStockProducts || []} />

      </div>

    </div>

  );

}