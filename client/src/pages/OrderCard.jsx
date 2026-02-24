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
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 hover:border-indigo-600 transition-all duration-500 group relative overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50">
      
      {/* HEADER DE LA CARTE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        
        {/* INFOS PRODUIT & NUMÉRO */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] overflow-hidden border border-gray-100">
              <img 
                src={getMainImage(firstItem)} 
                alt="order-thumb" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            {order.items?.length > 1 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[9px] font-[1000] w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg">
                +{order.items.length - 1}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package size={12} className="text-indigo-600" />
              <p className="text-[11px] font-[1000] text-black uppercase tracking-tighter font-mono">
                #{order.orderNumber}
              </p>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
              Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* MONTANT TOTAL */}
        <div className="flex flex-col md:items-end">
          <p className="text-[9px] font-[1000] text-gray-400 uppercase tracking-[0.2em] mb-1">Total payé</p>
          <span className="text-2xl font-[1000] text-black tracking-tighter leading-none italic">
            {Number(order?.totalAmount || 0).toLocaleString()} 
            <small className="ml-1 text-[10px] not-italic text-indigo-600">FCFA</small>
          </span>
        </div>

        {/* STATUT ET LIEN */}
        <div className="flex items-center gap-4 border-t md:border-t-0 pt-5 md:pt-0">
          <div 
            className="px-5 py-2.5 rounded-full text-[9px] font-[1000] uppercase tracking-widest text-white shadow-lg shadow-indigo-100 flex items-center gap-2"
            style={{ backgroundColor: ORDER_STATUS_COLORS[order.status] || "#000000" }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </div>
          <Link
            to={`/order/${order._id}`}
            className="w-12 h-12 bg-black text-white rounded-[1.2rem] flex items-center justify-center hover:bg-indigo-600 transition-all active:scale-90 shadow-xl"
          >
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>

      {/* --- BLOCS D'ACTIONS ÉTENDUS --- */}

      {/* RAPPROCHEMENT DU CYCLE DE RETOUR */}
      {order.status === 'DELIVERED' && (
        <div className="mt-8 pt-6 border-t border-dashed border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Livraison Certifiée</span>
          </div>
          {isReturnPossible() ? (
            <button
              onClick={handleReturnRequest}
              className="flex items-center gap-2 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white px-5 py-2.5 rounded-xl text-[9px] font-[1000] uppercase tracking-[0.1em] transition-all active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Initialiser un retour
            </button>
          ) : (
            <div className="flex items-center gap-2 text-gray-300">
              <Clock size={12} />
              <span className="text-[9px] uppercase font-[1000] tracking-widest italic">
                Délai de retour expiré
              </span>
            </div>
          )}
        </div>
      )}

      {/* RETOUR EN COURS D'EXAMEN */}
      {order.status === 'RETURN_REQUESTED' && (
        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100/50 flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
          <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.1em]">
            Dossier en cours d'examen par notre service logistique
          </p>
        </div>
      )}

      {/* CONFIRMATION DE REMBOURSEMENT */}
      {order.status === 'RETURNED' && (
        <div className="mt-8 pt-6 border-t border-dashed border-gray-100">
          <div className="bg-indigo-50 p-6 rounded-[1.8rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                <RotateCcw size={20} />
              </div>
              <div>
                <p className="text-[10px] font-[1000] text-indigo-900 uppercase leading-none mb-1">Retour Validé</p>
                <p className="text-[11px] font-bold text-indigo-600/70 italic">Avez-vous reçu vos fonds ?</p>
              </div>
            </div>
            <button
              onClick={handleConfirmReturn}
              className="w-full md:w-auto bg-black hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-[1000] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <BadgeCheck size={16} />
              Confirmer la Clôture
            </button>
          </div>
        </div>
      )}

      {/* ÉTAT FINAL : RETOUR COMPLÉTÉ */}
      {order.status === 'RETURNED_COMPLETED' && (
        <div className="mt-6 flex items-center justify-center gap-3 py-2 px-4 bg-gray-50 rounded-full w-fit mx-auto">
          <BadgeCheck size={14} className="text-gray-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
            Dossier archivé • {new Date(order.updatedAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
      )}
    </div>
  );
};

export default OrderCard;