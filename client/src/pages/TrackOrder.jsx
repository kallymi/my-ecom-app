import React, { useState } from 'react';
import api from '../api/axios';
import { Package, Truck, CheckCircle, Search, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from './OrderSatatus';

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
      setError(err.response?.data?.message || "Commande introuvable.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const steps = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];
  const getCurrentStep = (status) => steps.indexOf(status);

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-[900] tracking-tighter italic mb-4">SUIVI DE COLIS</h1>
          <p className="text-gray-500 font-medium">Entrez vos détails pour savoir où se trouve votre commande.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border mb-8">
          <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                placeholder="N° de Commande"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <div>
              <input
                type="tel"
                placeholder="Téléphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <button type="submit" disabled={loading}
              className="md:col-span-2 bg-black text-white py-5 rounded-2xl font-black uppercase hover:bg-blue-600 flex items-center justify-center gap-2">
              {loading ? "Recherche..." : <><Search size={20} /> Suivre</>}
            </button>
          </form>
          {error && <p className="text-red-500 mt-4 font-bold text-center">{error}</p>}
        </div>

        {order && (
          <div className="space-y-6">
            {/* Progression */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border">
              <div className="flex justify-between mb-8 relative">
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                <div
                  className="absolute top-5 left-0 h-1 bg-blue-600 transition-all duration-1000 -z-0"
                  style={{ width: `${(getCurrentStep(order.status)/(steps.length-1))*100}%` }}
                ></div>

                {steps.map((step, idx) => {
                  const isActive = idx <= getCurrentStep(order.status);
                  const isCurrent = idx === getCurrentStep(order.status);
                  return (
                    <div key={step} className="flex flex-col items-center relative z-10 w-1/4 text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                        ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-4 border-gray-100 text-gray-300'}
                        ${isCurrent ? 'ring-4 ring-blue-100 animate-pulse' : ''}`}>
                        {idx === 0 && <Package size={18} />}
                        {idx === 1 && <CheckCircle size={18} />}
                        {idx === 2 && <Truck size={18} />}
                        {idx === 3 && <CheckCircle size={18} />}
                      </div>
                      <span className="mt-3 text-[10px] font-black uppercase tracking-tighter">
                        {ORDER_STATUS_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                <div className="flex items-start gap-4">
                  <MapPin className="p-3 bg-blue-50 text-blue-600 rounded-2xl" size={24} />
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase">Destination</p>
                    <p className="font-bold text-lg">{order.shippingAddress.neighborhood}</p>
                    <p className="text-sm text-gray-500">{order.shippingAddress.addressDetails}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Calendar className="p-3 bg-green-50 text-green-600 rounded-2xl" size={24} />
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase">Date Commande</p>
                    <p className="font-bold text-lg">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Paiement : {order.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>
                
            {/* Articles */}
            <div className="bg-black text-white p-8 rounded-2xl shadow-xl">
              <h3 className="font-black italic mb-6">VOTRE COLIS CONTIENT :</h3>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span>{item.quantity}x {item.product?.name}</span>
                  <span>{(item.price*item.quantity).toLocaleString()} F</span>
                </div>
              ))}
              <div className="mt-6 flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase text-xs">Total réglé</span>
                <span className="text-2xl font-black">{order.totalAmount.toLocaleString()} F</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-10">
              <Link to="/" className="bg-white border border-gray-200 px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-white transition-all">
                Accueil
              </Link>
              <Link to="/shop" className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 transition-all">
                Continuer mes achats
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
