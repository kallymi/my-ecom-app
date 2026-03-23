import { useState } from "react";
import api from "../../api/axios";
import {
  XMarkIcon, MapPinIcon, PhoneIcon, UserIcon,
  CubeIcon, ChevronRightIcon
} from "@heroicons/react/24/outline";

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPING: "Expédition",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  RETURN_REQUESTED: "Retour demandé",
  RETURNED: "Retournée",
};

const STATUS_COLORS = {
  PENDING: "bg-orange-500",
  CONFIRMED: "bg-blue-600",
  SHIPPING: "bg-purple-600",
  DELIVERED: "bg-emerald-600",
  CANCELLED: "bg-gray-400",
  RETURN_REQUESTED: "bg-rose-500 animate-pulse",
  RETURNED: "bg-gray-600"
};

export default function OrderDetailModal({ order, onClose, onUpdate }) {
  if (!order) return null;

  const handleStatusUpdate = async (apiStatus) => {
    try {
      await api.put(`/admin/orders/${order._id}/status`, { status: apiStatus });
      onUpdate();
      onClose();
    } catch (error) {
      alert("Erreur de mise à jour");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Overlay plus sombre pour faire ressortir le blanc */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#FBFBFB] w-full max-w-lg h-[90vh] md:h-auto md:max-h-[85vh] rounded-t-[3rem] md:rounded-[2.5rem] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-500">
        
        {/* Barre de saisie mobile (Handle) */}
        <div className="h-1.5 w-12 bg-gray-200 rounded-full mx-auto mt-4 mb-2 shrink-0 md:hidden" />

        {/* HEADER ÉPURÉ */}
        <div className="px-8 py-6 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Détails Commande</p>
            <h2 className="text-2xl font-[1000] tracking-tighter italic text-gray-900">#{order.orderNumber}</h2>
          </div>
          <button onClick={onClose} className="p-3 bg-white shadow-sm border border-gray-100 rounded-2xl text-gray-400 active:scale-90 transition-transform">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 space-y-8 no-scrollbar pb-10">
          
          {/* STATUT ACTUEL - Discret mais clair */}
          <div className="flex items-center gap-3">
             <div className={`h-3 w-3 rounded-full ${STATUS_COLORS[order.status]}`} />
             <span className="text-xs font-black uppercase tracking-widest text-gray-600">
               {STATUS_LABELS[order.status]}
             </span>
          </div>

          {/* DESTINATAIRE - Style "Card" Minimaliste */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50/50 space-y-5">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Client</p>
                    <p className="text-sm font-black truncate uppercase">{order.shippingAddress?.fullName}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                    <PhoneIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contact</p>
                    <p className="text-sm font-black tracking-tighter">{order.shippingAddress?.phone}</p>
                  </div>
               </div>

               <div className="pt-4 border-t border-gray-50 flex gap-3 items-start">
                  <MapPinIcon className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tight">
                    {order.shippingAddress?.neighborhood} <span className="block font-normal normal-case italic opacity-70">{order.shippingAddress?.addressDetails}</span>
                  </p>
               </div>
            </div>
          </div>

          {/* PANIER - Liste compacte */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Articles</h3>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{order.items?.length}</span>
            </div>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                  <img src={item.product?.images?.[0]?.url} className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-grow min-w-0">
                    <p className="text-[11px] font-black uppercase truncate text-gray-800 leading-none">{item.product?.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">x{item.quantity}</p>
                  </div>
                  <p className="text-xs font-black italic shrink-0">{(item.unitPrice * item.quantity).toLocaleString()} F</p>
                </div>
              ))}
            </div>
          </div>

          {/* TOTAL - Version "Impact" */}
          <div className="bg-gray-900 rounded-[2.2rem] p-7 text-white flex justify-between items-end shadow-xl shadow-gray-200">
             <div>
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Montant Total</p>
               <p className="text-3xl font-[1000] italic tracking-tighter leading-none">{order.totalAmount?.toLocaleString()} <span className="text-xs not-italic text-blue-500 ml-1">FCFA</span></p>
             </div>
             <CubeIcon className="h-10 w-10 text-gray-800" />
          </div>
        </div>

        {/* ACTIONS - Grille 2 par 2 Ultra-claire */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0 pb-12 md:pb-8">
          <div className="grid grid-cols-2 gap-3">
            {['PENDING', 'CONFIRMED', 'SHIPPING'].includes(order.status) && (
              <>
                <MiniActionBtn 
                  label="Confirmer" 
                  color="bg-blue-600 shadow-blue-100" 
                  onClick={() => handleStatusUpdate('CONFIRMED')} 
                />
                <MiniActionBtn 
                  label="Expédier" 
                  color="bg-purple-600 shadow-purple-100" 
                  onClick={() => handleStatusUpdate('SHIPPING')} 
                />
                <MiniActionBtn 
                  label="Livrer" 
                  color="bg-emerald-600 shadow-emerald-100" 
                  onClick={() => handleStatusUpdate('DELIVERED')} 
                />
                <MiniActionBtn 
                  label="Annuler" 
                  color="bg-gray-100 !text-gray-400" 
                  onClick={() => handleStatusUpdate('CANCELLED')} 
                />
              </>
            )}
            {order.status === 'RETURN_REQUESTED' && (
               <button 
                 className="col-span-2 bg-black text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-transform"
                 onClick={() => handleStatusUpdate('RETURNED')}
               >
                 Valider le Retour de Stock
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniActionBtn({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white py-4 rounded-[1.4rem] font-black text-[11px] uppercase tracking-widest active:scale-[0.97] transition-all shadow-lg`}
    >
      {label}
    </button>
  );
}