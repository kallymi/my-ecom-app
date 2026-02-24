import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, RefreshCw, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import OrderHistory from './OrderHistory'; 

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    else setIsRefreshing(true);

    try {
      const { data } = await api.get('/orders/my-orders');
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Erreur récupération commandes :", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 space-y-10">
        <div className="space-y-4">
          <div className="h-3 w-24 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-12 md:h-16 w-48 md:w-64 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 md:h-44 w-full bg-gray-50 rounded-[2rem] md:rounded-[3rem] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 pt-8 md:pt-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* TOP BAR - Plus adaptée au mobile */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
            >
                <ArrowLeft size={18} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Retour</span>
            </button>
            
            <button 
                onClick={() => fetchOrders(false)}
                disabled={isRefreshing}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-600"
            >
                <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                {isRefreshing ? "..." : "Actualiser"}
            </button>
        </div>

        {/* TITRE PRINCIPAL - Tailles ajustées pour mobile */}
        <div className="mb-10 md:mb-16">
          <h1 className="text-4xl md:text-7xl font-[1000] tracking-tighter italic text-black uppercase leading-[0.9]">
            MES <br /> <span className="text-indigo-600">ACHATS.</span>
          </h1>
          <div className="mt-4 md:mt-6 flex items-center gap-3">
            <div className="h-[1px] w-8 md:w-12 bg-black" />
            <p className="text-gray-400 text-[10px] md:text-[11px] font-bold uppercase tracking-widest">
                {orders.length} Commandes passées
            </p>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-10 md:p-20 text-center border border-gray-50 shadow-sm animate-in fade-in zoom-in duration-700">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-gray-200" size={30} md:size={40} />
            </div>
            <h3 className="text-xl md:text-2xl font-[1000] text-black mb-3 uppercase italic">Aucun achat</h3>
            <p className="text-gray-400 mb-8 max-w-xs mx-auto font-medium text-xs md:text-sm">
              Votre historique de commandes est actuellement vide.
            </p>
            <Link to="/shop" className="inline-flex bg-black text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all active:scale-95">
              Boutique
            </Link>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-6 duration-700">
            <OrderHistory orders={orders} onRefresh={() => fetchOrders(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;