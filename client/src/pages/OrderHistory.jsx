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
  // Configuration des statuts
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

  const isReturnPossible = (order) => {
    if (order.status !== 'DELIVERED') return false;
    const now = new Date();
    // Vérifie si au moins un article a une date limite de retour valide
    const hasValidDeadline = order.items?.some(item => 
      item.returnDeadline && new Date(item.returnDeadline) > now
    );
    return hasValidDeadline;
  };

  const handleReturnRequest = async (orderId) => {
    if (window.confirm("Souhaitez-vous demander le retour de cette commande ?")) {
      const loadingToast = toast.loading("Envoi de la demande...");
      try {
        await api.put(`/orders/${orderId}/request-return`);
        toast.success("Demande de retour envoyée !", { id: loadingToast });
        if (onRefresh) onRefresh(); // Actualise la liste parente
      } catch (err) {
        toast.error(err.response?.data?.message || "Erreur lors de la demande", { id: loadingToast });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* BADGE INFO PAGINATION */}
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 rounded-full shadow-sm">
          <Layers size={14} className="text-indigo-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Affichage de <span className="text-black">{orders.length}</span> résultats
          </span>
        </div>
      </div>

      {/* GRILLE DES COMMANDES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {orders.map((order) => {
          const firstItem = order.items?.[0];
          const productData = firstItem?.product;

          return (
            <div 
              key={order._id} 
              className="bg-white rounded-[2rem] border border-gray-100 p-5 md:p-6 hover:border-indigo-500 transition-all duration-500 group relative flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 min-w-0">
                  {/* IMAGE AVEC LOGIQUE DE SECOURS */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                      {firstItem ? (
                        <img 
                          src={productData ? getMainImage(productData) : firstItem.image} 
                          alt="product" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/150?text=Produit";
                          }}
                        />
                      ) : (
                        <Package size={24} className="text-gray-200" />
                      )}
                    </div>
                    {order.items?.length > 1 && (
                      <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[9px] font-[1000] w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                        +{order.items.length - 1}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-col mb-1">
                      <span className="font-[1000] text-lg tracking-tighter uppercase italic leading-none truncate">
                        #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1.5">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 truncate max-w-[140px] uppercase">
                      {productData?.name || firstItem?.name || "Commande multiple"}
                    </p>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Montant</p>
                  <p className="text-lg font-[1000] text-black tracking-tighter">
                    {order.totalAmount?.toLocaleString()} <span className="text-[10px] text-indigo-600">F</span>
                  </p>
                </div>
              </div>

              {/* FOOTER CARD: STATUS & ACTIONS */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                  {statusConfig[order.status]?.icon}
                  {statusConfig[order.status]?.label || order.status}
                </span>

                <div className="flex items-center gap-2">
                  {/* Bouton de retour si éligible */}
                  {isReturnPossible(order) && (
                    <button
                      onClick={() => handleReturnRequest(order._id)}
                      className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-orange-600 hover:text-white transition-all"
                    >
                      <RefreshCcw size={12} />
                      Retourner
                    </button>
                  )}

                  <Link 
                    to={`/order/${order._id}`}
                    className="w-10 h-10 bg-gray-50 text-black rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-90 shadow-sm"
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