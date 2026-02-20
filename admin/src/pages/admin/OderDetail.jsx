
import { useState } from "react";
import api from "../../api/axios";
import {
  XMarkIcon, MapPinIcon, PhoneIcon, UserIcon,
  ClockIcon, TagIcon, ArrowPathIcon
} from "@heroicons/react/24/outline";

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPING: "En cours de livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  RETURN_REQUESTED: "Retour demandé",
  RETURNED: "Retournée",
};

const STATUS_TO_API = {
  "Confirmée": "CONFIRMED",
  "En cours de livraison": "SHIPPING",
  "Livrée": "DELIVERED",
  "Annulée": "CANCELLED",
  "Valider Retour": "RETURNED", // Ajout pour la gestion des retours
};

const STATUS_COLORS = {
  PENDING: "bg-orange-100 text-orange-600",
  CONFIRMED: "bg-blue-100 text-blue-600",
  SHIPPING: "bg-purple-100 text-purple-600",
  DELIVERED: "bg-green-100 text-green-600",
  CANCELLED: "bg-red-100 text-red-600",
  RETURN_REQUESTED: "bg-rose-100 text-rose-600 animate-pulse",
  RETURNED: "bg-gray-200 text-gray-700",
};

export default function OrderDetailModal({ order, onClose, onUpdate }) {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const handleStatusUpdate = async (apiStatus) => {
    setUpdating(true);
    try {
      await api.put(`/admin/orders/${order._id}/status`, { status: apiStatus });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("STATUS UPDATE ERROR:", error);
      alert(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  const currentStatusLabel = STATUS_LABELS[order.status] || order.status;

  // Calcul du délai de retour global (basé sur le premier article ou le plus proche)
  const returnDeadline = order.items?.[0]?.returnDeadline;
  const isReturnPeriodOver = returnDeadline && new Date(returnDeadline) < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
        
        {/* HEADER */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-[900] uppercase italic tracking-tighter text-black">
              Gestion Commande
            </h2>
            <p className="text-sm font-mono font-bold text-blue-600 flex items-center gap-2">
              <TagIcon className="h-4 w-4" /> #{order.orderNumber || order._id.slice(-8)}
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all group">
            <XMarkIcon className="h-6 w-6 text-gray-400 group-hover:text-black" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            {/* DESTINATION */}
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center md:text-left">Destination</h3>
              <div className="space-y-4">
                <InfoRow icon={UserIcon} value={order.shippingAddress?.fullName} />
                <InfoRow icon={PhoneIcon} value={order.shippingAddress?.phone} />
                <div className="flex items-start gap-4">
                  <IconBox icon={MapPinIcon} />
                  <div>
                    <p className="font-black text-black uppercase text-sm">{order.shippingAddress?.neighborhood}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.shippingAddress?.addressDetails}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* STATUT & FINANCES */}
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center md:text-left">État Actuel</h3>
              <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100">
                <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status]}`}>
                  {currentStatusLabel}
                </span>
                
                {/* Information sur le Chiffre d'Affaires */}
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase flex justify-between">
                    <span>Revenu comptabilisé :</span>
                    <span className={order.isRevenueCounted ? "text-emerald-600" : "text-amber-600"}>
                      {order.isRevenueCounted ? "OUI (SÉCURISÉ)" : "NON (EN ATTENTE)"}
                    </span>
                  </p>
                  {order.status === 'DELIVERED' && returnDeadline && (
                    <p className="text-[9px] font-bold text-gray-400 uppercase flex justify-between">
                      <span>Délai retour :</span>
                      <span className={isReturnPeriodOver ? "text-rose-600" : "text-blue-600"}>
                        {isReturnPeriodOver ? "EXPIRÉ" : `JUSQU'AU ${new Date(returnDeadline).toLocaleDateString()}`}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ARTICLES */}
          <div className="mb-10">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center md:text-left italic">
              Détails du Panier
            </h3>
            <div className="space-y-3">
              {order.items && order.items.map((item, index) => (
                <div 
                  key={index} 
                  className="group flex items-center gap-4 bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
                >
                  {/* Photo du Produit */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-white border border-gray-100">
                    <img
                      src={item.product?.images?.[0]?.url || "https://via.placeholder.com/150"}
                      alt={item.product?.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-1 right-1 bg-black text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-lg shadow-lg">
                      x{item.quantity}
                    </div>
                  </div>

                  {/* Infos Produit */}
                  <div className="flex-grow">
                    <h4 className="font-black text-black uppercase text-xs tracking-tight leading-tight">
                      {item.product?.name || "Produit supprimé"}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">
                      Réf: {item.product?._id?.slice(-6).toUpperCase()}
                    </p>
                  </div>

                  {/* Prix */}
                  <div className="text-right">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter italic">
                      {item.unitPrice?.toLocaleString()} FCFA
                    </p>
                    <p className="text-[9px] font-bold text-gray-300 uppercase mt-0.5">
                      Total: {(item.unitPrice * item.quantity)?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* RÉCAPITULATIF TOTAL */}
            <div className="mt-6 px-6 py-5 bg-black rounded-[2rem] flex justify-between items-center shadow-xl shadow-black/10">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Total Commande</span>
              <span className="text-xl font-[900] text-white italic tracking-tighter">
                {order.totalAmount?.toLocaleString()} FCFA
              </span>
            </div>
          </div>

          {/* ACTIONS DE GESTION DYNAMIQUES */}
          <div className="pt-8 border-t border-gray-100">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center italic">
              Actions prioritaires
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              
              {/* Actions standards si non livrée */}
              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
                <>
                  <ActionButton label="Confirmer" onClick={() => handleStatusUpdate('CONFIRMED')} color="bg-blue-600" />
                  <ActionButton label="Expédier" onClick={() => handleStatusUpdate('SHIPPING')} color="bg-purple-600" />
                  <ActionButton label="Livrer" onClick={() => handleStatusUpdate('DELIVERED')} color="bg-emerald-600" />
                  <ActionButton label="Annuler" onClick={() => handleStatusUpdate('CANCELLED')} color="bg-rose-600" />
                </>
              )}

              {/* Action spéciale si Retour demandé */}
              {order.status === 'RETURN_REQUESTED' && (
                <ActionButton 
                  label="Valider le Retour (Restock)" 
                  onClick={() => handleStatusUpdate('RETURNED')} 
                  color="bg-black"
                  icon={ArrowPathIcon}
                />
              )}

              {/* Si déjà livré, on peut forcer l'annulation/retour manuel si besoin */}
              {order.status === 'DELIVERED' && !isReturnPeriodOver && (
                <p className="text-[10px] font-black text-gray-400 uppercase">Commande sécurisée - En attente de clôture CA</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les boutons d'action plus propres
function ActionButton({ label, onClick, color, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}

// ... (Garder tes composants IconBox et InfoRow)
/* =========================
    UI SUB-COMPONENTS
   ========================= */

function IconBox({ icon: Icon }) {
  return (
    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm text-gray-400 group-hover:text-blue-600 transition-colors">
      <Icon className="h-4 w-4" />
    </div>
  );
}

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-4 group">
      <IconBox icon={Icon} />
      <span className="font-black text-black uppercase text-xs tracking-tight">{value || "—"}</span>
    </div>
  );
}