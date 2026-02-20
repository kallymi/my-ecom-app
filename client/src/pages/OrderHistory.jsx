import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { 
  Package, ChevronRight, Clock, CheckCircle2, 
  Truck, XCircle, ArrowRight, ShoppingBag 
} from 'lucide-react';
import api from '../api/axios';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuration des statuts (Synchronisé avec ton Backend)
  const statusConfig = {
    'PENDING': { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: <Clock size={14} /> },
    'CONFIRMED': { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 size={14} /> },
    'SHIPPING': { label: 'En cours d\'envoi', color: 'bg-indigo-100 text-indigo-700', icon: <Truck size={14} /> },
    'DELIVERED': { label: 'Livrée', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 size={14} /> },
    'CANCELLED': { label: 'Annulée', color: 'bg-rose-100 text-rose-700', icon: <XCircle size={14} /> },
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Erreur API:", error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 rounded-full w-48 mb-12" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-[2.5rem]" />
          ))}
        </div>
      </div>
    );
  }

  // Fonction pour calculer si le retour est encore possible (Deadline)
  const isReturnPossible = (order) => {
    if (order.status !== 'DELIVERED') return false;
    const now = new Date();
    
    // 1. Vérifie la deadline calculée par le backend
    const hasValidDeadline = order.items?.some(item => 
      item.returnDeadline && new Date(item.returnDeadline) > now
    );
    if (hasValidDeadline) return true;

    // 2. Sécurité : si returnDeadline absente, on check deliveredAt + 7 jours
    if (order.deliveredAt) {
      const deliveryDate = new Date(order.deliveredAt);
      const fallbackDeadline = new Date(deliveryDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      return now < fallbackDeadline;
    }
    return false;
  };

  // Fonction pour envoyer la demande
  const handleReturnRequest = async (orderId) => {
    if (window.confirm("Voulez-vous vraiment demander le retour de cette commande ?")) {
      
      // On cree une promesse pour afficher un chargement
      const loadingToast = toast.loading("Envoi de la demande");

      try {
        await api.put(`/orders/${orderId}/request-return`);
        
        // Succes ! On remplace le chargement par un message de reuisste
        
        toast.success("Demande envoyée ! Nous l'étudions dans les plus brefs délais.", {
          id: loadingToast,
          duration: 5000,
          icon: '📤',
        });
      } catch (err) {
        // Erreur !

        toast.error(err.response?.data?.message || "Une erreur est survenue", {
         id: loadingToast,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 pt-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">
              Espace Client
            </span>
            <h1 className="text-5xl font-[900] tracking-tighter italic text-black uppercase">
              Mes <span className="text-blue-600">Commandes.</span>
            </h1>
          </div>
          <p className="text-gray-400 font-bold text-sm max-w-xs md:text-right uppercase tracking-tighter">
            Historique de vos achats et suivi de vos colis en temps réel.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border border-gray-100 shadow-2xl shadow-gray-100/50">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-gray-100">
              <ShoppingBag className="text-gray-200" size={48} />
            </div>
            <h3 className="text-2xl font-[900] text-black mb-4 uppercase italic">Votre historique est vide</h3>
            <p className="text-gray-400 mb-10 max-w-sm mx-auto font-medium">
              Il semble que vous n'ayez pas encore passé de commande. Nos dernières collections vous attendent.
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-3 bg-black text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
            >
              Découvrir la boutique
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 hover:border-black transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/40"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  
                  {/* Left: Info Commande */}
                  <div className="flex gap-6">
                    <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:bg-blue-600 transition-colors">
                      <Package size={28} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="font-[900] text-xl tracking-tighter uppercase italic">
                          #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                          {statusConfig[order.status]?.icon}
                          {statusConfig[order.status]?.label || order.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest">
                        Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Right: Recap & Action */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-12 border-t lg:border-none pt-6 lg:pt-0">
                    <div className="hidden sm:block">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Articles</p>
                      <p className="font-bold text-sm italic">{order.items?.length || 0} Pièce(s)</p>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Montant Total</p>
                      <p className="text-2xl font-[900] text-black tracking-tighter">
                        {order.totalAmount?.toLocaleString()} <span className="text-xs">F</span>
                      </p>
                    </div>
                    {/* Bloc à insérer juste après le Montant Total */}
                    <div className="flex flex-col items-end gap-2">
                      {isReturnPossible(order) && (
                        <button
                          onClick={() => handleReturnRequest(order._id)}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
                        >
                          <Clock size={12} />
                          Demander un retour
                        </button>
                      )}

                      {order.status === 'RETURN_REQUESTED' && (
                        <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-xl flex items-center gap-3">
                          <div className="bg-orange-100 p-2 rounded-full">
                            <Clock className="text-orange-600" size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-orange-800 uppercase leading-none">Demande en cours</p>
                            <p className="text-[10px] text-orange-600 font-medium">L'administrateur vérifie votre demande de retour.</p>
                          </div>
                        </div>
                      )}

                      {order.status === 'RETURNED' && (
                        <div className="mt-4 p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-xl flex items-center gap-3">
                          <div className="bg-emerald-100 p-2 rounded-full">
                            <CheckCircle2 className="text-emerald-600" size={16} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-emerald-800 uppercase leading-none">Retour Accepté</p>
                            <p className="text-[10px] text-emerald-600 font-medium">Votre retour a été validé. Procédure de remboursement lancée.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Link 
                      to={`/order/${order._id}`}
                      className="w-14 h-14 bg-gray-50 text-black rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 active:scale-90"
                    >
                      <ChevronRight size={24} />
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