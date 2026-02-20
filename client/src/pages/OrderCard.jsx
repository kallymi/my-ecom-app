import React from "react";
import { Link } from "react-router-dom";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "./OrderSatatus";
import { ChevronRight, BadgeCheck, RotateCcw } from "lucide-react"; // Ajout de RotateCcw
import { getMainImage } from "../utils/getMainImage";
import api from "../api/axios";

const OrderCard = ({ order, onRefresh }) => {

  console.log("DONNÉES DE LA COMMANDE :", order);
  const firstItem = order.items?.[0]?.product;

  // 1. Logique : Confirmer la réception du remboursement (Fin de cycle)
  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (window.confirm("Confirmez-vous avoir reçu votre remboursement ou l'échange ?")) {
      try {
        await api.put(`/orders/${order._id}/confirm-return`);
        if (onRefresh) onRefresh();
      } catch (error) {
        alert(error.response?.data?.message || "Erreur lors de la confirmation");
      }
    }
  };

  // 2. Logique : Calculer si le retour est encore possible (Deadline)
  const isReturnPossible = () => {
    if (order.status !== 'DELIVERED') return false;
    
    const now = new Date();
    
    // Tentative 1: Utiliser la deadline spécifique de l'article (si elle existe)
    const hasValidDeadline = order.items?.some(item => 
      item.returnDeadline && new Date(item.returnDeadline) > now
    );

    if (hasValidDeadline) return true;

    // Tentative 2: Si pas de deadline, on autorise le retour pendant 7 jours 
    // après la dernière mise à jour (date de livraison)
    const deliveryDate = new Date(order.updatedAt);
    const fallbackDeadline = new Date(deliveryDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    return now < fallbackDeadline;
  };

  // 3. Logique : Envoyer la demande de retour initiale
  const handleReturnRequest = async (e) => {
    e.preventDefault();
    if (window.confirm("Voulez-vous vraiment demander le retour de cette commande ?")) {
      try {
        await api.put(`/orders/${order._id}/request-return`);
        alert("Votre demande de retour a été envoyée avec succès.");
        if (onRefresh) onRefresh();
      } catch (err) {
        alert(err.response?.data?.message || "Délai de retour dépassé ou erreur serveur.");
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

        {/* GAUCHE : IMAGE + NUMÉRO */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
              <img 
                src={getMainImage(firstItem)} 
                alt="order-thumb" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            {order.items?.length > 1 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                +{order.items.length - 1}
              </span>
            )}
          </div>

          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider font-mono">
              {order.orderNumber}
            </p>
            <p className="text-sm text-gray-400 font-medium">
              Passée le {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* CENTRE : TOTAL */}
        <div className="flex flex-col md:items-end">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total payé</p>
          <span className="text-lg font-black text-gray-900">
            {/* On s'assure que c'est un nombre et on met une valeur par défaut de 0 */}
            {Number(order?.totalAmount || 0).toLocaleString()} 
            <small className="ml-1 text-[10px]">FCFA</small>
          </span>
        </div>

        {/* DROITE : STATUT + LIEN */}
        <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0">
          <span
            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-sm"
            style={{ backgroundColor: ORDER_STATUS_COLORS[order.status] || "#9ca3af" }}
          >
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </span>
          <Link
            to={`/order/${order._id}`}
            className="p-3 bg-gray-50 hover:bg-black hover:text-white rounded-2xl transition-all group/btn shadow-sm"
          >
            <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* --- SECTIONS D'ACTIONS DYNAMIQUES --- */}

      {/* ACTION A : Demander un retour (Si livré et dans les temps) */}
      {order.status === 'DELIVERED' && (
        <div className="mt-6 pt-6 border-t border-dashed border-gray-100 flex items-center justify-end">
          {isReturnPossible() ? (
            <button
              onClick={handleReturnRequest}
              className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Demander un retour
            </button>
          ) : (
            <span className="text-[9px] text-gray-400 uppercase font-bold italic">
              Délai de retour expiré
            </span>
          )}
        </div>
      )}

      {/* ACTION B : En attente de validation Admin */}
      {order.status === 'RETURN_REQUESTED' && (
        <div className="mt-6 pt-4 border-t border-dashed border-gray-50 flex justify-center">
          <p className="text-[10px] font-bold text-orange-400 uppercase animate-pulse">
            Demande de retour en cours d'examen...
          </p>
        </div>
      )}

      {/* ACTION C : Confirmer la fin du retour (Argent reçu) */}
      {order.status === 'RETURNED' && (
        <div className="mt-6 pt-6 border-t border-dashed border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-tight italic">
            Retour validé. Veuillez confirmer la réception du remboursement :
          </p>
          <button
            onClick={handleConfirmReturn}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-100"
          >
            <BadgeCheck className="h-4 w-4" />
            Confirmer Réception
          </button>
        </div>
      )}

      {/* MESSAGE DÉFINITIF : Retour terminé */}
      {order.status === 'RETURNED_COMPLETED' && (
        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            Dossier clos le {new Date(order.updatedAt).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default OrderCard;