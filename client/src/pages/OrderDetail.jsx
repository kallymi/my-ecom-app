import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../services/orderService";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "./OrderSatatus";
import { getMainImage } from "../utils/getMainImage";
import { 
  ChevronLeft, 
  Clock, 
  ShieldAlert, 
  Truck, 
  CreditCard 
} from "lucide-react";
import toast from "react-hot-toast";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data.order);
    } catch (err) {
      toast.error("Impossible de récupérer la commande");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleReturnRequest = async () => {
    if (!window.confirm("Voulez-vous vraiment demander le retour de cette commande ?")) return;
    const load = toast.loading("Traitement...");
    try {
      await orderService.requestReturn(order._id);
      toast.success("Demande envoyée", { id: load });
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur", { id: load });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="p-10 text-center font-semibold uppercase text-gray-500">
      Commande introuvable
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 min-w-0">

        {/* NAV */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-black transition-all mb-6"
        >
          <ChevronLeft size={16} />
          <span className="text-[clamp(0.7rem,2vw,0.8rem)] uppercase">
            Retour
          </span>
        </button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">

          <div className="min-w-0">
            <h1 className="
              text-[clamp(1.8rem,6vw,2.8rem)]
              font-extrabold tracking-tight
              truncate
            ">
              #{order.orderNumber}
            </h1>

            <p className="
              text-gray-400 
              text-[clamp(0.7rem,2vw,0.8rem)]
              flex items-center gap-2 mt-2
            ">
              <Clock size={14} />
              {new Date(order.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* STATUS */}
          <div>
            <div 
              className="
                px-5 py-2 rounded-xl text-white
                text-[clamp(0.7rem,2vw,0.8rem)]
                font-semibold uppercase
              "
              style={{ backgroundColor: ORDER_STATUS_COLORS[order.status] }}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* RETURN BLOCK */}
            {order.status === 'DELIVERED' && (
              <div className="
                bg-white p-5 rounded-2xl border border-gray-100
                flex flex-col sm:flex-row justify-between gap-4
              ">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      Retour disponible
                    </p>
                    <p className="text-gray-400 text-xs">
                      {order.finalReturnDeadline
                        ? new Date(order.finalReturnDeadline).toLocaleDateString('fr-FR')
                        : "Voir conditions"}
                    </p>
                  </div>
                </div>

                {(!order.finalReturnDeadline || new Date(order.finalReturnDeadline) > new Date()) && (
                  <button 
                    onClick={handleReturnRequest}
                    className="
                      bg-black text-white px-5 py-2 rounded-xl
                      text-[clamp(0.7rem,2vw,0.8rem)]
                      hover:bg-red-600 transition-all
                    "
                  >
                    Retourner
                  </button>
                )}
              </div>
            )}

            {/* ITEMS */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

              <div className="px-5 py-3 border-b text-sm font-semibold text-gray-500">
                {order.items.length} produit(s)
              </div>

              <div className="divide-y">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row gap-4 items-center">

                    {/* IMAGE */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <img 
                        src={getMainImage(item.product)} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                    </div>

                    {/* INFO */}
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <h4 className="font-semibold truncate">
                        {item.product?.name || "Produit"}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {item.quantity} × {(item.price || item.product?.price || 0).toLocaleString()} F
                      </p>
                    </div>

                    {/* TOTAL */}
                    <div className="font-semibold text-indigo-600">
                      {((item.price || item.product?.price || 0) * item.quantity).toLocaleString()} F
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* SUMMARY */}
            <div className="bg-black text-white rounded-2xl p-6 space-y-4">

              <div className="flex items-center gap-2 text-sm text-gray-300">
                <CreditCard size={14} />
                Facturation
              </div>

              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{order.totalAmount?.toLocaleString()} F</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Livraison</span>
                <span className="text-green-400">Négocier</span>
              </div>

              <div className="border-t border-gray-700 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{order.totalAmount?.toLocaleString()} F</span>
              </div>

            </div>

            {/* SHIPPING */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
              <Truck size={18} className="text-indigo-600" />
              <div>
                <p className="text-sm font-semibold">Paiement à la livraison</p>
                <p className="text-xs text-gray-400">Méthode standard</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderDetail;