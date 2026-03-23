import React from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  Package, ChevronRight, Clock, CheckCircle2, 
  Truck, XCircle, RefreshCcw, AlertCircle, Layers
} from 'lucide-react';
import api from '../api/axios';
import { getMainImage } from '../utils/getMainImage';

const OrderHistory = ({ orders, onRefresh }) => {

  // CONFIGURATION DES STATUTS
  const statusConfig = {
    'PENDING': { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: <Clock size={12} /> },
    'CONFIRMED': { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 size={12} /> },
    'SHIPPING': { label: 'En cours d\'envoi', color: 'bg-indigo-100 text-indigo-700', icon: <Truck size={12} /> },
    'DELIVERED': { label: 'Livrée', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={12} /> },
    'CANCELLED': { label: 'Annulée', color: 'bg-rose-100 text-rose-700', icon: <XCircle size={12} /> },
    'RETURN_REQUESTED': { label: 'Retour demandé', color: 'bg-orange-100 text-orange-700', icon: <RefreshCcw size={12} /> },
    'RETURNED': { label: 'Retourné', color: 'bg-gray-100 text-gray-700', icon: <AlertCircle size={12} /> },
    'RETURNED_COMPLETED': { label: 'Retour clos', color: 'bg-gray-200 text-gray-500', icon: <Package size={12} /> },
  };

  // VERIFIER SI RETOUR POSSIBLE
  const isReturnPossible = (order) => {
    if (order.status !== 'DELIVERED') return false;
    const now = new Date();

    return order.items?.some(item => 
      item.returnDeadline && new Date(item.returnDeadline) > now
    );
  };

  // DEMANDE DE RETOUR
  const handleReturnRequest = async (orderId) => {
    if (window.confirm("Souhaitez-vous demander le retour de cette commande ?")) {
      const loadingToast = toast.loading("Envoi de la demande...");
      try {
        await api.put(`/orders/${orderId}/request-return`);
        toast.success("Demande de retour envoyée !", { id: loadingToast });
        if (onRefresh) onRefresh();
      } catch (err) {
        toast.error(err.response?.data?.message || "Erreur lors de la demande", { id: loadingToast });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4 min-w-0">

      {/* BADGE HEADER */}
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm">
          <Layers size={14} className="text-indigo-600" />
          <span className="text-[clamp(0.7rem,2vw,0.8rem)] font-semibold uppercase tracking-wide text-gray-500">
            Affichage de <span className="text-black">{orders.length}</span> résultats
          </span>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {orders.map((order) => {
          const firstItem = order.items?.[0];
          const productData = firstItem?.product;

          return (
            <div 
              key={order._id}
              className="
                bg-white rounded-[2rem] border border-gray-100 
                p-4 sm:p-6 
                transition-all duration-500 
                hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1
                group flex flex-col justify-between
              "
            >

              {/* HEADER */}
              <div className="flex justify-between items-start mb-5 gap-3">

                <div className="flex gap-3 min-w-0">

                  {/* IMAGE */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                      {firstItem ? (
                        <img 
                          src={productData ? getMainImage(productData) : firstItem.image} 
                          alt="product"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/150?text=Produit";
                          }}
                        />
                      ) : (
                        <Package size={22} className="text-gray-200" />
                      )}
                    </div>

                    {/* BADGE MULTI PRODUIT */}
                    {order.items?.length > 1 && (
                      <span className="
                        absolute -top-2 -right-2 
                        bg-indigo-600 text-white 
                        text-[10px] font-semibold
                        w-6 h-6 rounded-full 
                        flex items-center justify-center 
                        ring-2 ring-white shadow
                      ">
                        +{order.items.length - 1}
                      </span>
                    )}
                  </div>

                  {/* INFOS */}
                  <div className="min-w-0">

                    <span className="
                      block
                      text-[clamp(0.9rem,3vw,1.1rem)]
                      font-extrabold tracking-tight uppercase
                      truncate
                    ">
                      #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                    </span>

                    <span className="
                      text-gray-400 
                      text-[clamp(0.65rem,2vw,0.75rem)]
                      uppercase tracking-wide
                      block mt-1
                    ">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', { 
                        day: 'numeric', month: 'short', year: 'numeric' 
                      })}
                    </span>

                    <p className="
                      text-gray-500 
                      text-[clamp(0.7rem,2vw,0.8rem)]
                      truncate max-w-[160px] sm:max-w-[200px]
                      mt-1
                    ">
                      {productData?.name || firstItem?.name || "Commande multiple"}
                    </p>

                  </div>
                </div>

                {/* PRIX */}
                <div className="text-right shrink-0">
                  <p className="text-gray-400 text-[clamp(0.6rem,2vw,0.7rem)] uppercase">
                    Montant
                  </p>
                  <p className="text-[clamp(1rem,3vw,1.3rem)] font-extrabold text-black">
                    {order.totalAmount?.toLocaleString()} 
                    <span className="text-indigo-600 ml-1 text-sm">F</span>
                  </p>
                </div>

              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">

                {/* STATUS */}
                <span className={`
                  flex items-center gap-1.5 
                  px-3 py-1.5 rounded-full
                  text-[clamp(0.65rem,2vw,0.75rem)]
                  font-semibold uppercase tracking-wide
                  ${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-600'}
                `}>
                  {statusConfig[order.status]?.icon}
                  {statusConfig[order.status]?.label || order.status}
                </span>

                {/* ACTIONS */}
                <div className="flex items-center gap-2">

                  {isReturnPossible(order) && (
                    <button
                      onClick={() => handleReturnRequest(order._id)}
                      className="
                        flex items-center gap-2 
                        px-3 py-2 rounded-xl
                        text-[clamp(0.65rem,2vw,0.75rem)]
                        font-semibold uppercase
                        bg-orange-50 text-orange-600
                        hover:bg-orange-600 hover:text-white
                        transition-all duration-300
                        active:scale-95
                      "
                    >
                      <RefreshCcw size={14} />
                      Retour
                    </button>
                  )}

                  <Link 
                    to={`/order/${order._id}`}
                    className="
                      w-10 h-10 
                      bg-gray-50 rounded-xl
                      flex items-center justify-center
                      hover:bg-black hover:text-white
                      transition-all duration-300
                      active:scale-90
                    "
                  >
                    <ChevronRight size={18} />
                  </Link>

                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;