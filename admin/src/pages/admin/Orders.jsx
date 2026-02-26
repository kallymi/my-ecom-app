import { useEffect, useState } from "react";
import api from "../../api/axios";
import OrderDetailModal from "./OderDetail";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  ShoppingBagIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPING: "Livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS = {
  PENDING: "bg-orange-50 text-orange-600 border-orange-100",
  CONFIRMED: "bg-blue-50 text-blue-600 border-blue-100",
  SHIPPING: "bg-purple-50 text-purple-600 border-purple-100",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-600 border-red-100",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
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
      console.error("Erreur fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    let result = [...orders];
    if (statusFilter !== "ALL") result = result.filter((o) => o.status === statusFilter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((o) => 
        o.orderNumber?.toLowerCase().includes(term) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(term) ||
        o.shippingAddress?.phone?.toLowerCase().includes(term) ||
        o.shippingAddress?.neighborhood?.toLowerCase().includes(term)
      );
    }
    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

  return (
    <div className="p-4 md:p-8 bg-[#FBFBFB] min-h-screen font-sans">
      
      {/* HEADER : Adaptatif de Colonne à Ligne */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-[1000] text-black italic tracking-[ -0.05em] uppercase leading-none">
            Commandes<span className="text-blue-600">.</span>
          </h1>
          <div className="flex gap-4 md:gap-8 mt-4 overflow-x-auto pb-2 no-scrollbar">
            <StatItem label="Total" value={orders.length} color="text-black" />
            <StatItem label="Attente" value={orders.filter(o => o.status === 'PENDING').length} color="text-orange-500" />
            <StatItem label="Livré" value={orders.filter(o => o.status === 'DELIVERED').length} color="text-emerald-500" />
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-black/5"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* FILTRES : Stackés sur Mobile */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-grow group">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher (Nom, Tel, N°...)"
            className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-[1.5rem] font-bold text-sm shadow-sm focus:ring-2 focus:ring-blue-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative min-w-full lg:min-w-[240px]">
          <FunnelIcon className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            className="w-full pl-14 pr-10 py-4 bg-white border-none rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-sm appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            {Object.keys(STATUS_LABELS).map(key => <option key={key} value={key}>{STATUS_LABELS[key]}</option>)}
          </select>
        </div>
      </div>

      {/* TABLEAU RESPONSIVE */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl shadow-black/[0.02] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="hidden md:table-row bg-gray-50/50">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Commande</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client / Tel</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quartier</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Montant</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
                <th className="p-6 text-right"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((o) => (
                <tr key={o._id} className="flex flex-col md:table-row p-4 md:p-0 hover:bg-gray-50/30 transition-colors">
                  
                  {/* ID COMMANDE */}
                  <td className="md:p-6 py-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gray-100 rounded-xl text-gray-900 md:bg-blue-50 md:text-blue-600">
                        <ShoppingBagIcon className="h-5 w-5" />
                      </div>
                      <div>
                         <p className="md:hidden text-[9px] font-black text-gray-400 uppercase tracking-widest">ID Commande</p>
                         <span className="font-mono font-black text-sm uppercase leading-none italic">#{o.orderNumber}</span>
                      </div>
                    </div>
                  </td>

                  {/* CLIENT & TEL */}
                  <td className="md:p-6 py-2">
                    <div className="flex flex-col">
                       <p className="md:hidden text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Client</p>
                       <div className="flex items-center gap-2 font-bold text-sm lowercase leading-none">
                          <UserIcon className="h-3.5 w-3.5 text-blue-500 hidden md:block" /> {o.shippingAddress?.fullName}
                       </div>
                       <div className="text-[11px] text-gray-400 font-bold mt-1 flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" /> {o.shippingAddress?.phone}
                       </div>
                    </div>
                  </td>

                  {/* QUARTIER */}
                  <td className="md:p-6 py-2">
                    <div className="flex flex-col">
                      <p className="md:hidden text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                      <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-gray-600">
                        <MapPinIcon className="h-4 w-4 text-rose-500" />
                        {o.shippingAddress?.neighborhood}
                      </div>
                    </div>
                  </td>

                  {/* MONTANT */}
                  <td className="md:p-6 py-2">
                    <div className="flex items-baseline md:block">
                      <p className="md:hidden text-[9px] font-black text-gray-400 uppercase tracking-widest mr-2">Total:</p>
                      <span className="font-[1000] text-lg md:text-base">{o.totalAmount?.toLocaleString()}</span>
                      <span className="text-[10px] ml-1 font-black text-gray-400">FCFA</span>
                    </div>
                  </td>

                  {/* STATUT */}
                  <td className="md:p-6 py-3">
                    <span className={`inline-flex px-4 py-1.5 rounded-xl text-[9px] font-[1000] uppercase border tracking-widest ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td className="md:p-6 py-4 md:text-right">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="w-full md:w-auto bg-black text-white px-8 md:px-6 py-3.5 md:py-2.5 rounded-xl text-[10px] font-[1000] uppercase tracking-tighter hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-black/5"
                    >
                      Gérer la commande
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

// Sous-composant pour les Stats
const StatItem = ({ label, value, color }) => (
  <div className="flex flex-col min-w-[80px]">
    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</span>
    <span className={`text-2xl font-[1000] tracking-tighter ${color}`}>{value}</span>
  </div>
);