import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import OrderDetailModal from "./OderDetail";
import { OrderRow } from "../../components/order/OrderRow";
import { StatCard } from "../../components/order/StatCard";
import { 
  MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon, 
  ShoppingBagIcon, ArchiveBoxIcon

} from "@heroicons/react/24/outline";

const STATUS_LABELS = {
  PENDING: "Attente",
  CONFIRMED: "Confirmée",
  SHIPPING: "Livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS = {
  PENDING: "bg-orange-50 text-orange-700 border-orange-100",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-100",
  SHIPPING: "bg-purple-50 text-purple-700 border-purple-100",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/admin/all");
      setOrders(res.data.orders || []);

    } catch (err) { 
      console.error("Erreur flux:", err); 
    } finally { 
      setLoading(false); 

    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Calcul des statistiques en temps réel
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
  }), [orders]);

  // Filtrage ultra-rapide avec useMemo
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        o.orderNumber?.toLowerCase().includes(term) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [orders, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24">
      
      {/* SECTION HEADER & STATS */}
      <div className="bg-white border-b border-gray-100 md:rounded-b-[3rem] md:shadow-sm mb-8 md:mb-12">
        <div className="max-w-[1600px] mx-auto px-6 py-10 md:py-16">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="text-center lg:text-left">
              <span className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px] mb-3 block">
                Gestion Logistique
              </span>
              <h1 className="text-5xl md:text-7xl font-[1000] italic leading-none tracking-tighter uppercase text-black">
                Flux <span className="text-blue-600">Commandes.</span>
              </h1>
            </div>

            {/* STATS : Design épuré horizontal */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x w-full lg:w-auto px-4 md:px-0">
              <StatCard label="Total" value={stats.total} type="total" />
              <StatCard label="Attente" value={stats.pending} type="pending" />
              <StatCard label="Livrées" value={stats.delivered} type="delivered" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* BARRE D'OUTILS (SEARCH & FILTER) */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-10 sticky top-4 z-40">
          <div className="relative w-full md:flex-1 group">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher par #ID ou Client..."
              className="w-full pl-16 pr-8 py-5 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl shadow-black/[0.02] outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-56 group">
              <FunnelIcon className="h-4 w-4 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                className="w-full pl-12 pr-10 py-5 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl shadow-black/[0.02] appearance-none cursor-pointer outline-none font-black text-[10px] uppercase tracking-widest focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tous les Statuts</option>
                {Object.keys(STATUS_LABELS).map(key => <option key={key} value={key}>{STATUS_LABELS[key]}</option>)}
              </select>
            </div>

            <button 
              onClick={fetchOrders} 
              className="p-5 bg-black text-white rounded-2xl hover:bg-blue-600 transition-all active:scale-90 shadow-xl"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* CONTENEUR LISTE / TABLEAU */}
        <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-2xl shadow-black/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-50">
                  <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Détails Commande</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] hidden md:table-cell">Client</th>
                  <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] hidden lg:table-cell">Zone</th>
                  <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Montant</th>
                  <th className="px-8 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Statut</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  /* SKELETON LOADING */
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="p-8"><div className="h-12 bg-gray-50 rounded-xl w-full" /></td>
                    </tr>
                  ))
                ) : (
                  filteredOrders.map((o) => (
                    <OrderRow 
                      key={o._id} 
                      order={o} 
                      onSelect={setSelectedOrder} 
                      statusColors={STATUS_COLORS} 
                      statusLabels={STATUS_LABELS} 
                    />
                  ))
                )}
              </tbody>
            </table>

            {/* EMPTY STATE */}
            {filteredOrders.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-32 group">
                <div className="p-10 bg-gray-50 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
                  <ArchiveBoxIcon className="h-16 w-16 text-gray-200" />
                </div>
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Aucun résultat</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                  Essayez d'ajuster vos filtres ou la recherche
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={fetchOrders}
        />
      )}
    </div>
  );
}

