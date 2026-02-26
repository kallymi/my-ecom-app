import React from "react";
import { Link } from "react-router-dom";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "./OrderSatatus";
import { ChevronRight, BadgeCheck, RotateCcw, Package, Clock, ShieldCheck } from "lucide-react";
import { getMainImage } from "../utils/getMainImage";
import api from "../api/axios";
import toast from "react-hot-toast";

const OrderCard = ({ order, onRefresh }) => {
  const firstItem = order.items?.[0]?.product;

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (window.confirm("Confirmez-vous avoir reçu votre remboursement ou l'échange ?")) {
      const load = toast.loading("Finalisation du dossier...");
      try {
        await api.put(`/orders/${order._id}/confirm-return`);
        toast.success("Dossier clos avec succès", { id: load });
        if (onRefresh) onRefresh();
      } catch (error) {
        toast.error(error.response?.data?.message || "Erreur de confirmation", { id: load });
      }
    }
  };

  const isReturnPossible = () => {
    if (order.status !== 'DELIVERED') return false;
    const now = new Date();
    const hasValidDeadline = order.items?.some(item => 
      item.returnDeadline && new Date(item.returnDeadline) > now
    );
    if (hasValidDeadline) return true;
    const deliveryDate = new Date(order.updatedAt);
    const fallbackDeadline = new Date(deliveryDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    return now < fallbackDeadline;
  };

  const handleReturnRequest = async (e) => {
    e.preventDefault();
    if (window.confirm("Voulez-vous vraiment demander le retour de cette commande ?")) {
      const load = toast.loading("Envoi de la demande...");
      try {
        await api.put(`/orders/${order._id}/request-return`);
        toast.success("Demande de retour transmise", { id: load });
        if (onRefresh) onRefresh();
      } catch (err) {
        toast.error(err.response?.data?.message || "Délai dépassé", { id: load });
      }
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 hover:border-indigo-600 transition-all duration-500 group relative overflow-hidden shadow-sm hover:shadow-xl">
      
      {/* HEADER : On utilise flex-row même sur mobile pour gagner de la hauteur */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        
        {/* Zone Gauche : Image & ID */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-50 rounded-xl md:rounded-[1.5rem] overflow-hidden border border-gray-100">
              <img 
                src={getMainImage(order.items?.[0]?.product)} 
                alt="thumb" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            {order.items?.length > 1 && (
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[8px] font-[1000] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                +{order.items.length - 1}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-[10px] md:text-[11px] font-black text-black uppercase font-mono truncate">
                #{order.orderNumber}
              </p>
            </div>
            <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Zone Droite : Prix & Status (Plus compact) */}
        <div className="flex flex-col items-end shrink-0">
           <span className="text-sm md:text-xl font-[1000] text-black tracking-tighter italic">
            {Number(order?.totalAmount || 0).toLocaleString()} 
            <small className="ml-0.5 text-[8px] not-italic text-indigo-600 uppercase">F</small>
          </span>
          <div 
            className="mt-1.5 px-3 py-1 md:px-5 md:py-2 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-1.5"
            style={{ backgroundColor: ORDER_STATUS_COLORS[order.status] || "#000000" }}
          >
            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS : Plus discret */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           {order.status === 'DELIVERED' && (
             <div className="flex items-center gap-1 text-emerald-500">
               <ShieldCheck size={12} />
               <span className="text-[8px] font-black uppercase tracking-tighter hidden sm:block">Certifiée</span>
             </div>
           )}
           <Link
              to={`/order/${order._id}`}
              className="text-[9px] font-black text-indigo-600 uppercase hover:text-black transition-colors"
            >
              Détails commande →
            </Link>
        </div>

        {/* Boutons d'actions conditionnels (Version compacte) */}
        {order.status === 'DELIVERED' && isReturnPossible() && (
          <button
            onClick={handleReturnRequest}
            className="text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all"
          >
            Retourner
          </button>
        )}

        {order.status === 'RETURNED' && (
          <button
            onClick={handleConfirmReturn}
            className="bg-black text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Clôturer
          </button>
        )}
      </div>

      {/* Message discret pour RETURN_REQUESTED */}
      {order.status === 'RETURN_REQUESTED' && (
        <div className="mt-3 text-center py-2 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-[8px] font-black text-amber-700 uppercase tracking-tight">
            Examen logistique en cours...
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderCard;