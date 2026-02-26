import { useState } from "react";
import api from "../../api/axios";
import {
  XMarkIcon, MapPinIcon, PhoneIcon, UserIcon,
  TagIcon, ArrowPathIcon, CubeIcon, CreditCardIcon,
  CalendarDaysIcon, ShieldCheckIcon
} from "@heroicons/react/24/outline";

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPING: "En expédition",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  RETURN_REQUESTED: "Retour demandé",
  RETURNED: "Retournée",
};

const STATUS_COLORS = {
  PENDING: "bg-orange-50 text-orange-600 border-orange-100",
  CONFIRMED: "bg-blue-50 text-blue-600 border-blue-100",
  SHIPPING: "bg-purple-50 text-purple-600 border-purple-100",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-600 border-red-100",
  RETURN_REQUESTED: "bg-rose-50 text-rose-600 border-rose-100 animate-pulse",
  RETURNED: "bg-gray-100 text-gray-700 border-gray-200",
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
      alert(error.response?.data?.message || "Erreur de mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  const returnDeadline = order.items?.[0]?.returnDeadline;
  const isReturnPeriodOver = returnDeadline && new Date(returnDeadline) < new Date();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-6 overflow-hidden">
      {/* Overlay avec flou intense */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative bg-[#FBFBFB] w-full max-w-3xl h-full md:h-auto md:max-h-[90vh] md:rounded-[3rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
        
        {/* HEADER FIXE */}
        <div className="sticky top-0 z-10 p-6 md:p-8 bg-white/80 backdrop-blur-md border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black rounded-2xl text-white shadow-lg shadow-black/20">
              <CubeIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-[1000] uppercase italic tracking-tighter leading-none">
                Commande <span className="text-blue-600">Détails</span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black font-mono text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                  ID: {order.orderNumber || order._id.slice(-8)}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-gray-50 hover:bg-black hover:text-white rounded-2xl transition-all duration-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* CONTENT SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          
          {/* GRID: INFOS CLIENT & STATUS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CARTE DESTINATION */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" /> Destination
              </h3>
              <div className="space-y-4">
                <InfoItem icon={UserIcon} label="Client" value={order.shippingAddress?.fullName} />
                <InfoItem icon={PhoneIcon} label="Contact" value={order.shippingAddress?.phone} />
                <div className="pt-4 border-t border-gray-50">
                   <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{order.shippingAddress?.neighborhood}</p>
                   <p className="text-sm font-bold text-gray-500 leading-tight">{order.shippingAddress?.addressDetails}</p>
                </div>
              </div>
            </div>

            {/* CARTE STATUS & FINANCES */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4" /> État & Paiement
              </h3>
              <div className="space-y-5">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase">Statut Actuel</span>
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-[1000] uppercase border tracking-widest ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                  <FinanceRow 
                    label="Revenu comptabilisé" 
                    value={order.isRevenueCounted ? "Sécurisé" : "En attente"} 
                    isSuccess={order.isRevenueCounted}
                  />
                  {order.status === 'DELIVERED' && (
                    <FinanceRow 
                      label="Délai de retour" 
                      value={isReturnPeriodOver ? "Expiré" : `Jusqu'au ${new Date(returnDeadline).toLocaleDateString()}`}
                      isError={isReturnPeriodOver}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION ARTICLES */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-4">
               Panier ({order.items?.length} articles)
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="group flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 hover:border-blue-200 transition-all">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-50">
                    <img 
                      src={item.product?.images?.[0]?.url || "https://via.placeholder.com/150"} 
                      className="h-full w-full object-cover" 
                      alt=""
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-black uppercase text-black leading-tight">{item.product?.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Qté: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-black">{item.unitPrice?.toLocaleString()} F</p>
                    <p className="text-[9px] font-black text-blue-500 uppercase">Total: {(item.unitPrice * item.quantity).toLocaleString()} F</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TOTAL BANNER */}
          <div className="bg-black p-8 rounded-[2.5rem] flex flex-row justify-between items-center text-white shadow-2xl shadow-black/20">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Total TTC</p>
              <h3 className="text-3xl font-[1000] italic tracking-tighter">{order.totalAmount?.toLocaleString()} <span className="text-blue-500 text-lg">FCFA</span></h3>
            </div>
            <div className="hidden sm:block p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
               <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

        </div>

        {/* FOOTER: ACTIONS (Fixe en bas) */}
        <div className="p-6 md:p-8 bg-white border-t border-gray-100">
           <div className="flex flex-wrap justify-center gap-3">
              {/* Logique d'affichage des boutons */}
              {['PENDING', 'CONFIRMED', 'SHIPPING'].includes(order.status) && (
                <>
                  <ActionButton label="Confirmer" onClick={() => handleStatusUpdate('CONFIRMED')} color="bg-blue-600" />
                  <ActionButton label="Expédier" onClick={() => handleStatusUpdate('SHIPPING')} color="bg-purple-600" />
                  <ActionButton label="Livrer" onClick={() => handleStatusUpdate('DELIVERED')} color="bg-emerald-600" />
                  <ActionButton label="Annuler" onClick={() => handleStatusUpdate('CANCELLED')} color="bg-rose-600" />
                </>
              )}
              {order.status === 'RETURN_REQUESTED' && (
                <ActionButton 
                  label="Valider Retour & Restock" 
                  icon={ArrowPathIcon} 
                  onClick={() => handleStatusUpdate('RETURNED')} 
                  color="bg-black" 
                />
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

// COMPOSANTS INTERNES UTILES
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">{label}</p>
        <p className="text-[11px] md:text-xs font-black text-black uppercase">{value || "—"}</p>
      </div>
    </div>
  );
}

function FinanceRow({ label, value, isSuccess, isError }) {
  return (
    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
      <span className="text-gray-400">{label}</span>
      <span className={isSuccess ? "text-emerald-600" : isError ? "text-rose-600" : "text-amber-600"}>
        {value}
      </span>
    </div>
  );
}

function ActionButton({ label, onClick, color, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}