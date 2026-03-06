import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, RefreshCw, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import OrderHistory from './OrderHistory'; 

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  
  const navigate = useNavigate();

  const fetchOrders = useCallback(async (page = 1, showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    else setIsRefreshing(true);

    try {
      // Appel API avec le paramètre de pagination
      const { data } = await api.get(`/orders/my-orders?page=${page}`);
      
      if (data.success) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
        setTotalOrders(data.totalOrders || 0);
        
        // Scroll fluide vers le haut pour voir les nouvelles commandes
        if (!showSkeleton) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (error) {
      console.error("Erreur récupération commandes :", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Déclenchement au chargement et au changement de page
  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 space-y-10">
        <div className="space-y-4">
          <div className="h-3 w-24 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-12 md:h-16 w-48 md:w-64 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 md:h-44 w-full bg-gray-50 rounded-[2rem] md:rounded-[3rem] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 pt-8 md:pt-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Retour</span>
          </button>
          
          <button 
            onClick={() => fetchOrders(currentPage, false)}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-600 disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Chargement..." : "Actualiser"}
          </button>
        </div>

        {/* TITRE PRINCIPAL */}
        <div className="mb-10 md:mb-16">
          <h1 className="text-4xl md:text-7xl font-[1000] tracking-tighter italic text-black uppercase leading-[0.9]">
            MES <br /> <span className="text-indigo-600">ACHATS.</span>
          </h1>
          <div className="mt-4 md:mt-6 flex items-center gap-3">
            <div className="h-[1px] w-8 md:w-12 bg-black" />
            <p className="text-gray-400 text-[10px] md:text-[11px] font-bold uppercase tracking-widest">
              {totalOrders} {totalOrders > 1 ? 'Commandes passées' : 'Commande passée'}
            </p>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-10 md:p-20 text-center border border-gray-50 shadow-sm animate-in fade-in zoom-in duration-700">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-gray-200" size={30} />
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
          <div className="space-y-12">
            <div className="animate-in slide-in-from-bottom-6 duration-700">
              <OrderHistory orders={orders} />
            </div>

            {/* SYSTÈME DE PAGINATION */}
            {/* SYSTÈME DE PAGINATION CONDENSÉ */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 pb-10">
                {/* Bouton Précédent */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white border border-gray-100 disabled:opacity-30 shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const maxVisible = 3; // Nombre de pages autour de la page actuelle

                    for (let i = 1; i <= totalPages; i++) {
                      // Toujours afficher la première page, la dernière page, et les pages proches de l'actuelle
                      if (
                        i === 1 || 
                        i === totalPages || 
                        (i >= currentPage - 1 && i <= currentPage + 1)
                      ) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`w-9 h-9 rounded-xl font-black text-[10px] transition-all ${
                              currentPage === i 
                              ? 'bg-black text-white shadow-lg scale-110' 
                              : 'bg-white text-gray-400 border border-gray-100'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      } else if (
                        i === currentPage - 2 || 
                        i === currentPage + 2
                      ) {
                        // Ajouter les points de suspension
                        pages.push(<span key={`sep-${i}`} className="px-1 text-gray-400 font-bold">...</span>);
                      }
                    }
                    return pages;
                  })()}
                </div>

                {/* Bouton Suivant */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white border border-gray-100 disabled:opacity-30 shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;