import { useEffect, useState } from "react";
import api from "../../api/axios";
import OrderDetailModal from "./OderDetail";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

/* =======================
   MAPPINGS STATUTS
======================= */

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPING: "En cours de livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const STATUS_COLORS = {
  PENDING: "bg-orange-100 text-orange-600",
  CONFIRMED: "bg-blue-100 text-blue-600",
  SHIPPING: "bg-purple-100 text-purple-600",
  DELIVERED: "bg-green-100 text-green-600",
  CANCELLED: "bg-red-100 text-red-600",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* =======================
     FETCH COMMANDES
  ======================= */

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/admin/all");
      setOrders(res.data.orders || []);
      setFilteredOrders(res.data.orders || []);
    } catch (err) {
      console.error("Erreur fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =======================
     FILTRAGE
  ======================= */

  useEffect(() => {
    let result = [...orders];

    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(term) ||
          o.shippingAddress?.neighborhood?.toLowerCase().includes(term) ||
          o.shippingAddress?.fullName?.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-[900] text-black italic tracking-tighter">
            COMMANDES.
          </h1>
          <p className="text-gray-400 font-medium">
            Gestion et suivi des commandes clients
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-gray-50"
        >
          <ArrowPathIcon
            className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
          />
          Actualiser
        </button>
      </div>

      {/* FILTRES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Recherche par numéro, client ou quartier..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <FunnelIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm font-bold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmée</option>
            <option value="SHIPPING">En cours de livraison</option>
            <option value="DELIVERED">Livrée</option>
            <option value="CANCELLED">Annulée</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-6 text-xs font-black text-gray-400 uppercase">
                  Commande
                </th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase">
                  Quartier
                </th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase">
                  Client
                </th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase">
                  Total
                </th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase">
                  Statut
                </th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="p-6 font-mono font-black text-blue-600">
                      {o.orderNumber}
                    </td>

                    <td className="p-6 font-black uppercase">
                      {o.shippingAddress?.neighborhood}
                    </td>

                    <td className="p-6">
                      <div className="font-bold">
                        {o.shippingAddress?.fullName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {o.shippingAddress?.phone}
                      </div>
                    </td>

                    <td className="p-6 font-black">
                      {o.totalAmount?.toLocaleString()} F
                    </td>

                    <td className="p-6">
                      <span
                        className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                          STATUS_COLORS[o.status]
                        }`}
                      >
                        {STATUS_LABELS[o.status]}
                      </span>
                    </td>

                    <td className="p-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="bg-black text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-blue-600"
                      >
                        GÉRER
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-16 text-center text-gray-400 font-bold italic"
                  >
                    Aucune commande trouvée
                  </td>
                </tr>
              )}
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
