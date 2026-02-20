import React, { useState } from 'react';
import api from '../api/axios';
import { Package, Truck, CheckCircle, Search, MapPin, Calendar, Phone, ArrowRight, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ORDER_STATUS_LABELS } from './OrderSatatus';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/track/${orderNumber.toUpperCase()}?phone=${phone}`);
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Commande introuvable ou informations incorrectes.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];
  const getCurrentStep = (status) => steps.indexOf(status);

  // Helper pour les icônes de statut
  const getStatusIcon = (step, isActive) => {
    switch (step) {
      case 'PENDING': return <Clock size={20} className={isActive ? 'text-white' : 'text-gray-400'} />;
      case 'CONFIRMED': return <CheckCircle size={20} className={isActive ? 'text-white' : 'text-gray-400'} />;
      case 'SHIPPING': return <Truck size={20} className={isActive ? 'text-white' : 'text-gray-400'} />;
      case 'DELIVERED': return <Package size={20} className={isActive ? 'text-white' : 'text-gray-400'} />;
      default: return <Package size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 pt-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Hero */}
        <div className="text-center mb-12">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 inline-block">
            Logistique & Suivi
          </span>
          <h1 className="text-5xl font-[900] tracking-tighter italic text-black mb-4">
            SUIVRE MON <span className="text-blue-600">COLIS.</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-md mx-auto">
            Entrez votre numéro de commande pour obtenir une mise à jour en temps réel.
          </p>
        </div>

        {/* Formulaire de recherche stylisé */}
        <div className="bg-white p-2 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 mb-12">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center bg-gray-50 rounded-[2rem] px-6 py-4 border-2 border-transparent focus-within:border-black focus-within:bg-white transition-all">
              <Search size={18} className="text-gray-400 mr-3" />
              <input
                placeholder="N° DE COMMANDE (ex: CMD-XXXX)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="bg-transparent w-full outline-none font-black uppercase placeholder:text-gray-300 text-sm"
                required
              />
            </div>
            <div className="flex-1 flex items-center bg-gray-50 rounded-[2rem] px-6 py-4 border-2 border-transparent focus-within:border-black focus-within:bg-white transition-all">
              <Phone size={18} className="text-gray-400 mr-3" />
              <input
                type="tel"
                placeholder="TÉLÉPHONE UTILISÉ"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent w-full outline-none font-black placeholder:text-gray-300 text-sm"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 shadow-xl shadow-black/10"
            >
              {loading ? "Recherche..." : "Localiser"} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {error && (
          <div className="flex items-center gap-3 justify-center text-rose-600 bg-rose-50 p-4 rounded-2xl border border-rose-100 animate-in fade-in zoom-in">
            <XCircle size={18} />
            <span className="font-black text-xs uppercase">{error}</span>
          </div>
        )}

        {/* Résultats du suivi */}
        {order && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            
            {/* Timeline de progression */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                {/* Ligne de fond (Desktop) */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-8 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                    style={{ width: `${(getCurrentStep(order.status) / (steps.length - 1)) * 100}%` }}
                   />
                </div>

                {steps.map((step, idx) => {
                  const isActive = idx <= getCurrentStep(order.status);
                  const isCurrent = idx === getCurrentStep(order.status);
                  
                  return (
                    <div key={step} className="flex md:flex-col items-center gap-4 md:gap-0 relative z-10 w-full md:w-1/4">
                      <div className={`
                        w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                        ${isActive ? 'bg-black shadow-xl shadow-black/20 scale-110' : 'bg-white border-2 border-gray-100'}
                        ${isCurrent ? 'ring-4 ring-blue-100 border-blue-600' : ''}
                      `}>
                        {getStatusIcon(step, isActive)}
                      </div>
                      <div className="md:mt-6 text-left md:text-center">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-black' : 'text-gray-300'}`}>
                          {ORDER_STATUS_LABELS[step] || step}
                        </p>
                        {isCurrent && <span className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">En cours</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Infos Destination & Date */}
              <div className="grid md:grid-cols-2 gap-8 mt-16 pt-10 border-t border-gray-50">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lieu de livraison</h4>
                    <p className="font-black text-lg uppercase italic leading-tight">{order.shippingAddress.neighborhood}</p>
                    <p className="text-gray-500 text-sm font-medium">{order.shippingAddress.addressDetails}</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date d'expédition</h4>
                    <p className="font-black text-lg uppercase italic leading-tight">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-gray-500 text-sm font-medium">Référence : {order.orderNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails Commande Style "Facture Noire" */}
            <div className="bg-black rounded-[3rem] p-10 text-white shadow-2xl shadow-black/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Package size={120} />
              </div>
              
              <h3 className="text-xl font-[900] italic uppercase mb-8 border-b border-white/10 pb-4">Récapitulatif</h3>
              
              <div className="space-y-4 mb-8">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <span className="bg-white/10 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black">
                        {item.quantity}
                      </span>
                      <span className="font-bold text-sm uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                        {item.product?.name || "Produit"}
                      </span>
                    </div>
                    <span className="font-black text-sm">{(item.price * item.quantity).toLocaleString()} F</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Montant Total</p>
                  <p className="text-4xl font-[900] tracking-tighter">{order.totalAmount.toLocaleString()} F</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Paiement</p>
                  <p className="font-bold text-xs uppercase">{order.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Footer de page */}
            <div className="flex flex-col md:flex-row justify-center gap-4 pt-8">
               <Link to="/shop" className="bg-gray-100 text-black px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all text-center">
                Continuer Shopping
              </Link>
              <button onClick={() => window.print()} className="bg-white border-2 border-black text-black px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition-all">
                Imprimer le reçu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;