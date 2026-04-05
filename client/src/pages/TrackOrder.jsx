import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Package, Truck, CheckCircle, Search, MapPin, 
  Calendar, ArrowRight, Box, Clock, ShieldCheck, 
  Printer, Phone, XCircle, Loader2 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ORDER_STATUS_LABELS } from './OrderSatatus';
import toast from 'react-hot-toast';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderParam = params.get('order');
    const phoneParam = params.get('phone');

    if (orderParam && phoneParam) {
      setOrderNumber(orderParam);
      setPhone(phoneParam);
      // On peut appeler directement handleTrack ou une version simplifiée
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/orders/track/${orderParam.trim().toUpperCase()}?phone=${phoneParam.trim()}`);
          console.log("Données reçues :", res.data.order);
          setOrder(res.data.order || res.data);
        } catch (err) {
          console.error("Erreur tracking auto", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [location]);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Nettoyage de l'input et appel API
      const cleanOrderNum = orderNumber.trim().toUpperCase();
      const res = await api.get(`/orders/track/${cleanOrderNum}?phone=${phone.trim()}`);
      
      setOrder(res.data.order || res.data);
      toast.success("Commande localisée.");
    } catch (err) {
      toast.error("Commande introuvable. Vérifiez vos accès.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];
  const getCurrentStep = (status) => steps.indexOf(status);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 pt-6 md:pt-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER HERO - Ajusté pour mobile */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />
            Live System Tracking
          </div>
          <h1 className="text-2xl md:text-3xl font-[1000] tracking-tighter italic text-black mb-4 leading-none uppercase">
            Suivire mon <span className="text-indigo-600 font-black">Colis.</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest max-w-[250px] mx-auto opacity-60">
            Protocole de localisation en temps réel
          </p>
        </div>

        {/* RECHERCHE - Design "Capsule" */}
        <div className="bg-white p-2 md:p-3 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl shadow-gray-200/40 border border-gray-50 mb-12 md:mb-20">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center bg-gray-50 rounded-[2rem] px-6 py-4 group focus-within:bg-white focus-within:ring-2 ring-indigo-100 transition-all">
              <Search size={18} className="text-gray-300 mr-3" />
              <input
                placeholder="CMD-****"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="bg-transparent w-full outline-none font-black uppercase text-[11px] tracking-widest"
                required
              />
            </div>
            <div className="flex-1 flex items-center bg-gray-50 rounded-[2rem] px-6 py-4 group focus-within:bg-white focus-within:ring-2 ring-indigo-100 transition-all">
              <Phone size={18} className="text-gray-300 mr-3" />
              <input
                type="tel"
                placeholder="TÉLÉPHONE"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent w-full outline-none font-black text-[11px] tracking-widest"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-10 py-5 rounded-[2rem] font-[1000] uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Tracer"} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* RÉSULTATS */}
        {order && (
          <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
            
            {/* TIMELINE VISUELLE */}
            <div className="bg-white p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] border border-gray-50 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
                
                {/* Ligne de fond (Desktop) */}
                <div className="hidden md:block absolute top-10 left-0 w-full h-[2px] bg-gray-50">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-[1.5s] ease-in-out"
                      style={{ width: `${(getCurrentStep(order.status) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {steps.map((step, idx) => {
                  const isActive = idx <= getCurrentStep(order.status);
                  const isCurrent = idx === getCurrentStep(order.status);
                  
                  return (
                    <div key={step} className="flex md:flex-col items-center gap-5 md:gap-0 relative z-10 w-full md:w-1/4">
                      <div className={`
                        w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2.2rem] flex items-center justify-center transition-all duration-700
                        ${isActive ? 'bg-black text-white shadow-xl shadow-indigo-100' : 'bg-gray-50 text-gray-200'}
                        ${isCurrent ? 'ring-[6px] md:ring-8 ring-indigo-50 bg-indigo-600 scale-110' : ''}
                      `}>
                        {idx === 0 && <Clock size={idx === 0 && isCurrent ? 24 : 20} />}
                        {idx === 1 && <ShieldCheck size={20} />}
                        {idx === 2 && <Truck size={20} />}
                        {idx === 3 && <Package size={20} />}
                      </div>
                      <div className="md:mt-8 text-left md:text-center">
                        <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-black' : 'text-gray-300'}`}>
                          {ORDER_STATUS_LABELS[step] || step}
                        </p>
                        {isCurrent && (
                          <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-tighter md:block">Actuel</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BENTO GRID INFOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-50 flex items-center gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</h4>
                  <p className="font-black text-lg md:text-xl italic uppercase tracking-tight leading-none">{order.shippingAddress.neighborhood}</p>
                  <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase truncate max-w-[180px]">{order.shippingAddress.addressDetails}</p>
                </div>
              </div>
              
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-50 flex items-center gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                  <Calendar size={22} />
                </div>
                <div>
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</h4>
                  <p className="font-black text-lg md:text-xl italic uppercase tracking-tight leading-none">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="text-indigo-600 text-[10px] font-black mt-1 uppercase tracking-widest">ID: {order.orderNumber}</p>
                </div>
              </div>
            </div>

            {/* FACTURE NOIRE FUTURISTE */}
            <div className="bg-[#050505] rounded-[3rem] md:rounded-[4rem] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] group-hover:opacity-50 transition-all" />
              
              <div className="relative flex justify-between items-center mb-10 md:mb-12">
                <h3 className="text-xl md:text-2xl font-[1000] italic uppercase tracking-tighter">Votre <span className="text-indigo-500 font-black">Colis.</span></h3>
                <Package className="text-white/10" size={32} />
              </div>
              
              <div className="space-y-5 md:space-y-6 mb-10 md:mb-12 border-b border-white/5 pb-10">
                {order.items.map((item, idx) => {
                  // 🛡️ Logique de récupération de l'image et du prix
                  const displayPrice = item.price || item.unitPrice || 0;
                  
                  // On récupère l'image : soit dans le produit peuplé, soit dans le snapshot image du controller
                  const itemImage = item.product?.images?.[0]?.url || item.product?.image || item.image || 'https://via.placeholder.com/150';
                  const itemName = item.product?.name || item.name || "Article Standard";

                  return (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        {/* VIGNETTE IMAGE */}
                        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                          <img 
                            src={itemImage} 
                            alt={itemName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                          />
                          <div className="absolute top-0 right-0 bg-indigo-600 text-[8px] font-[1000] px-1.5 py-0.5 rounded-bl-lg">
                            x{item.quantity || 1}
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="font-bold text-[11px] md:text-sm uppercase tracking-wider text-gray-100 truncate max-w-[120px] md:max-w-xs leading-tight">
                            {itemName}
                          </span>
                          <span className="text-[9px] text-indigo-400/60 font-black uppercase tracking-widest mt-0.5">
                            Réf: {item.product?._id?.substring(0, 6) || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-sm md:text-lg italic text-white block">
                          {Number(displayPrice * (item.quantity || 1)).toLocaleString()} F
                        </span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase">
                          {Number(displayPrice).toLocaleString()} F / unité
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4">
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">Total Payé</p>
                  <p className="text-4xl md:text-6xl font-[1000] tracking-tighter text-white uppercase italic leading-none">
                    {(order.totalAmount || 0 ).toLocaleString()} <span className="text-xs md:text-sm font-black italic text-indigo-500 ml-1">CFA</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 w-full md:w-auto">
                    <div className="text-right flex-1 md:flex-none">
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Méthode de paiement </p>
                      <p className="font-black text-[10px] uppercase tracking-tighter">{order.paymentMethod === 'COD' ? 'Paiement a la livraison' : order.paymentMethod}</p>
                    </div>
                    <ShieldCheck size={24} className="text-indigo-500" />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 pt-6 md:pt-10">
              <button 
                onClick={() => window.print()}
                className="bg-white border border-gray-100 text-black px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Imprimer
              </button>
              <Link 
                to="/shop" 
                className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
              >
                Boutique <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;