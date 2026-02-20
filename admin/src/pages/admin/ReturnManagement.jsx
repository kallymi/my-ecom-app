import React, { useState, useEffect } from 'react';
import api from "../../api/axios";
import toast from "react-hot-toast";
import { 
  CheckCircle, 
  XCircle, 
  Package, 
  Clock, 
  ArrowRight, 
  AlertCircle,
  Search,
  RefreshCcw
} from "lucide-react";

const AdminReturnManagement = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReturnRequests = async () => {
        try {
            setLoading(true);
            // On filtre les commandes qui ont le statut RETURN_REQUESTED
            const { data } = await api.get('/admin/orders/returns');
            setRequests(data.orders || []);
        } catch (err) {
            toast.error("Impossible de récupérer les demandes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchReturnRequests(); 
    }, []);

    const handleAction = async (id, action) => {
        // action peut être 'approve' ou 'reject'
        const promise = api.put(`/admin/orders/${id}/${action}-return`);
        
        await toast.promise(promise, {
            loading: 'Mise à jour du stock et du statut...',
            success: action === 'approve' ? 'Retour validé et stock mis à jour !' : 'Demande de retour rejetée.',
            error: (err) => err.response?.data?.message || 'Erreur lors de l\'action',
        });
        
        fetchReturnRequests(); 
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <RefreshCcw className="animate-spin text-blue-600" size={32} />
            <p className="font-black text-[10px] uppercase tracking-widest text-gray-400">Chargement des demandes...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase">
                        Gestion des <span className="text-blue-600">Retours.</span>
                    </h1>
                    <p className="text-gray-400 font-medium text-sm">
                        {requests.length} demande(s) en attente d'approbation.
                    </p>
                </div>
                <button 
                    onClick={fetchReturnRequests}
                    className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <RefreshCcw size={20} className="text-gray-400" />
                </button>
            </div>

            {/* List Section */}
            <div className="grid gap-6">
                {requests.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-gray-200" size={40} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic text-gray-300">Tout est à jour</h3>
                        <p className="text-gray-400 text-sm font-medium">Aucune demande de retour n'est en attente actuellement.</p>
                    </div>
                ) : (
                    requests.map(order => (
                        <div 
                            key={order._id} 
                            className="group bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-900/5"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                
                                {/* Info Client & Commande */}
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                                        <Package size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-black text-lg tracking-tighter uppercase italic">
                                                #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock size={12} /> En attente
                                            </span>
                                        </div>
                                        <p className="text-gray-900 font-bold text-sm uppercase">
                                            {order.shippingAddress?.fullName || "Client Inconnu"}
                                        </p>
                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            Commandé le {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Détails Articles */}
                                <div className="flex-1 bg-gray-50/50 rounded-3xl p-4 border border-gray-100">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Articles à retourner</p>
                                    <div className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-gray-700 truncate max-w-[200px]">
                                                    {item.product?.name || "Produit"}
                                                </span>
                                                <span className="font-black bg-white px-2 py-0.5 rounded-lg border border-gray-100">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <div className="text-right mr-4">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Remboursement</p>
                                        <p className="text-xl font-black tracking-tighter text-gray-900">
                                            {order.totalAmount?.toLocaleString()} <span className="text-xs">F</span>
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleAction(order._id, 'reject')}
                                            className="h-14 w-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"
                                            title="Refuser le retour"
                                        >
                                            <XCircle size={24} />
                                        </button>
                                        <button 
                                            onClick={() => handleAction(order._id, 'approve')}
                                            className="h-14 px-6 bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                                        >
                                            <CheckCircle size={20} />
                                            <span className="font-black text-xs uppercase tracking-widest">Approuver</span>
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