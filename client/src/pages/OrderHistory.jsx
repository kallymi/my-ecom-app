import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  Package, ChevronRight, Clock, CheckCircle2, 
  Truck, XCircle, ArrowRight, ShoppingBag, 
  RefreshCcw, AlertCircle
} from 'lucide-react';
import api from '../api/axios';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuration des statuts enrichie
  const statusConfig = {
    'PENDING': { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: <Clock size={12} /> },
    'CONFIRMED': { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 size={12} /> },
    'SHIPPING': { label: 'En cours d\'envoi', color: 'bg-indigo-100 text-indigo-700', icon: <Truck size={12} /> },
    'DELIVERED': { label: 'Livrée', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={12} /> },
    'CANCELLED': { label: 'Annulée', color: 'bg-rose-100 text-rose-700', icon: <XCircle size={12} /> },
    'RETURN_REQUESTED': { label: 'Retour demandé', color: 'bg-orange-100 text-orange-700', icon: <RefreshCcw size={12} /> },
    'RETURNED': { label: 'Retourné', color: 'bg-gray-100 text-gray-700', icon: <AlertCircle size={12} /> },
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        if (data.success) setOrders(data.orders);
      } catch (error) {
        console.error("Erreur API:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const isReturnPossible = (order) => {
    if (order.status !== 'DELIVERED') return false;
    const now = new Date();
    const hasValidDeadline = order.items?.some(item => 
      item.returnDeadline && new Date(item.returnDeadline) > now
    );
    if (hasValidDeadline) return true;
    if (order.deliveredAt) {
      const fallbackDeadline = new Date(new Date(order.deliveredAt).getTime() + (7 * 24 * 60 * 60 * 1000));
      return now < fallbackDeadline;
    }
    return false;
  };

  const handleReturnRequest = async (orderId) => {
    if (window.confirm("Demander le retour de cette commande ?")) {
      const loadingToast = toast.loading("Envoi de la demande...");
      try {
        await api.put(`/orders/${orderId}/request-return`);
        toast.success("Demande envoyée !", { id: loadingToast });
        setOrders(orders.map(o => o._id === orderId ? {...o, status: 'RETURN_REQUESTED'} : o));
      } catch (err) {
        toast.error(err.response?.data?.message || "Erreur lors de la demande", { id: loadingToast });
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-100 rounded-xl w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-50 rounded-[2rem]" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 pt-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION (Affiné) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-1">
            <span className="text-indigo-600 font-black uppercase tracking-[0.3em] text-[9px]">Espace Client</span>
            <h1 className="text-4xl md:text-5xl font-[1000] tracking-tighter italic text-black uppercase leading-none">
              MES <span className="text-indigo-600">COMMANDES.</span>
            </h1>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Total achats</p>
                <p className="text-xl font-[1000] italic leading-none">{orders.length}</p>
             </div>
             <div className="w-[1px] h-8 bg-gray-100" />
             <ShoppingBag size={20} className="text-indigo-600" />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border border-gray-100 shadow-xl shadow-gray-100/50">
            <ShoppingBag className="text-gray-200 mx-auto mb-6" size={48} />
            <h3 className="text-xl font-[1000] text-black mb-2 uppercase italic tracking-tighter">Votre historique est vide</h3>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto font-medium text-xs">Nos dernières collections vous attendent.</p>
            <Link to="/shop" className="bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-indigo-600 transition-all inline-flex items-center gap-2">
              Boutique <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* GRID SYSTEM : 1 col sur mobile, 2 col sur desktop */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-[2rem] border border-gray-100 p-5 md:p-6 hover:border-indigo-500 transition-all duration-500 group relative flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:bg-indigo-600 transition-colors shadow-lg shadow-black/5">
                      <Package size={24} />
                    </div>
                    <div>
                      <div className="flex flex-col mb-1">
                        <span className="font-[1000] text-lg tracking-tighter uppercase italic leading-none">
                          #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mt-1">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Montant</p>
                    <p className="text-lg font-[1000] text-black tracking-tighter">
                      {order.totalAmount?.toLocaleString()} <span className="text-[10px] text-indigo-600">F</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-50">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${statusConfig[order.status]?.color}`}>
                    {statusConfig[order.status]?.icon}
                    {statusConfig[order.status]?.label}
                  </span>

                  <div className="flex items-center gap-3">
                    {/* Action de retour discrète */}
                    {isReturnPossible(order) && (
                      <button
                        onClick={() => handleReturnRequest(order._id)}
                        className="text-rose-500 hover:text-rose-700 transition-colors"
                        title="Demander un retour"
                      >
                        <RefreshCcw size={16} />
                      </button>
                    )}
                    
                    {order.status === 'RETURN_REQUESTED' && (
                       <Clock size={16} className="text-orange-400 animate-pulse" />
                    )}

                    <Link 
                      to={`/order/${order._id}`}
                      className="w-10 h-10 bg-gray-50 text-black rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-90"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;