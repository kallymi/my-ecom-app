import React, { useState, useEffect } from 'react';
import api from "../../api/axios";
import toast from "react-hot-toast";
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Clock, 
  RefreshCcw,
  User,
  Calendar,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

const AdminReturnManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReturnRequests = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/orders/returns');
            setRequests(data.orders || []);
        } catch (err) {
            toast.error("Impossible de récupérer les demandes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReturnRequests(); }, []);

    const handleAction = async (id, action) => {
        // 1. Demander un motif si on rejette (ou même pour valider)
        const reason = window.prompt(`Entrez un motif pour cette action (${action === 'reject' ? 'Obligatoire pour rejet' : 'Optionnel'}):`);
        
        // Si l'action est 'reject' et qu'aucun motif n'est saisi, on annule
        if (action === 'reject' && !reason) {
            toast.error("Un motif est requis pour rejeter un retour.");
            return;
        }

        const promise = api.put(`/admin/orders/${id}/${action}-return`, { 
            reason: reason || "Aucune note fournie" 
        });
        
        await toast.promise(promise, {
            loading: 'Mise à jour du système...',
            success: action === 'approve' ? 'Retour validé !' : 'Demande rejetée.',
            error: (err) => err.response?.data?.message || 'Erreur lors de l\'action',
        });
        
        fetchReturnRequests(); 
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6 transition-all animate-pulse">
            <div className="p-5 bg-blue-50 rounded-full">
                <RefreshCcw className="animate-spin text-blue-600" size={40} />
            </div>
            <p className="font-black text-[11px] uppercase tracking-[0.3em] text-blue-600/50 italic">Synchronisation de la base...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 font-sans">
            
            {/* HEADER DYNAMIQUE */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-5xl md:text-6xl font-[1000] italic tracking-tighter uppercase leading-tight">
                        Logistique <span className="text-blue-600">Retours.</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            <AlertCircle size={14} className="text-orange-400" />
                            {requests.length} Dossier(s) critique(s)
                        </span>
                    </div>
                </div>
                
                <button 
                    onClick={fetchReturnRequests}
                    className="group flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] hover:bg-black hover:text-white transition-all duration-500 shadow-xl shadow-black/5 active:scale-90"
                >
                    <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Rafraîchir</span>
                </button>
            </div>

            {/* LISTE DES DEMANDES */}
            <div className="grid gap-8">
                {requests.length === 0 ? (
                    <div className="bg-white rounded-[4rem] p-24 text-center border border-gray-50 shadow-sm">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <ShieldCheck size={48} />
                        </div>
                        <h3 className="text-2xl font-[1000] uppercase italic tracking-tighter text-gray-900 mb-2">Flux sécurisé</h3>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Aucune anomalie ou demande en attente.</p>
                    </div>
                ) : (
                    requests.map(order => (
                        <div 
                            key={order._id} 
                            className="group bg-white rounded-[2.5rem] border border-gray-100 p-2 md:p-3 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden"
                        >
                            <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2">
                                
                                {/* Section Gauche: Identité */}
                                <div className="p-6 md:p-8 bg-gray-50/50 rounded-[2rem] flex items-center gap-6 min-w-[320px]">
                                    <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center shrink-0 relative">
                                        <Package className="text-gray-900" size={28} />
                                        <span className="absolute -top-2 -right-2 h-6 w-6 bg-orange-500 text-white text-[10px] font-black flex items-center justify-center rounded-lg animate-bounce">!</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono font-[1000] text-xl tracking-tighter uppercase text-blue-600">
                                                #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                                            <User size={12} />
                                            <p className="text-[11px] font-black uppercase tracking-tight truncate max-w-[150px]">
                                                {order.shippingAddress?.fullName}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar size={12} />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section Centrale: Articles */}
                                {/* Section Centrale: Articles */}
                                {/* Section Centrale: Articles */}
                                <div className="flex-grow p-6 md:p-8">
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <div className="h-1 w-4 bg-orange-400 rounded-full"></div>
                                        Contenu du retour
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center p-2 bg-white border border-gray-50 rounded-xl group-hover:border-blue-100 transition-colors gap-3">
                                                
                                                {/* IMAGE DU PRODUIT (Snapshot du modèle Order) */}
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-50">
                                                    <img 
                                                        src={item.image} // On utilise directement item.image stocké dans la commande
                                                        alt={item.name} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = "/placeholder-p.png"; }} // Image de secours
                                                    />
                                                </div>
                                                
                                                <div className="flex-grow min-w-0">
                                                    <p className="text-[10px] font-black text-gray-700 truncate uppercase tracking-tight">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-blue-600 uppercase">
                                                        Réf: {item.product?.slice(-6).toUpperCase()}
                                                    </p>
                                                </div>

                                                <span className="font-black text-[10px] bg-gray-900 text-white px-2 py-1 rounded-md shrink-0">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section Droite: Finances & Actions */}
                                <div className="p-6 md:p-8 flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-6 border-t xl:border-t-0 xl:border-l border-gray-100 min-w-[280px]">
                                    <div className="text-left xl:text-right">
                                        <p className="text-[9px] font-[1000] text-gray-400 uppercase tracking-widest mb-1">Montant Remboursable</p>
                                        <h3 className="text-3xl font-[1000] tracking-tighter text-gray-900 leading-none">
                                            {order.totalAmount?.toLocaleString()} <span className="text-sm italic">CFA</span>
                                        </h3>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleAction(order._id, 'reject')}
                                            className="h-14 w-14 border-2 border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all active:scale-90 group/btn"
                                            title="Rejeter la demande"
                                        >
                                            <XCircle size={24} className="group-hover/btn:rotate-90 transition-transform" />
                                        </button>
                                        <button 
                                            onClick={() => handleAction(order._id, 'approve')}
                                            className="h-14 px-8 bg-black text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-2xl shadow-black/10 active:scale-95 group/btn"
                                        >
                                            <CheckCircle size={20} className="text-emerald-400" />
                                            <span className="font-black text-[10px] uppercase tracking-widest">Valider & Restocker</span>
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminReturnManagement;