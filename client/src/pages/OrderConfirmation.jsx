import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  ArrowRight, 
  Download, 
  Share2, 
  ShoppingBag,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti'; // Optionnel : npm install canvas-confetti

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  // Petit effet de confettis à l'arrivée pour le côté "Célébration"
  useEffect(() => {
    if (order) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#000000', '#818CF8']
      });
    }
  }, [order]);

  // Si on accède à la page sans commande (accès direct URL), on redirige
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Commande introuvable</h2>
          <Link to="/shop" className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest">Retourner à la boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-12 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* L'ICÔNE DE SUCCÈS ANIMÉE */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-24 h-24 bg-black rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 animate-in zoom-in duration-700">
              <CheckCircle size={44} className="text-indigo-400" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-[1000] tracking-tighter italic uppercase leading-none mb-4">
            MERCI <br /> <span className="text-indigo-600">CLIENT.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Confirmation de commande reçue</p>
        </div>

        {/* CARTE PRINCIPALE : RÉCAPITULATIF TECH */}
        <div className="bg-white rounded-[3rem] md:rounded-[4rem] border border-gray-50 shadow-sm overflow-hidden mb-8">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-gray-50">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Numéro de transaction</p>
                <h3 className="text-xl font-[1000] italic uppercase tracking-tighter">#{order.orderNumber}</h3>
              </div>
              <div className="flex gap-3">
                <button className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all">
                  <Download size={18} />
                </button>
                <button className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* BENTO INFO : LIVRAISON & PAIEMENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              <div className="bg-[#FAFAFA] p-6 rounded-[2.5rem] flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <Truck size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Mode de livraison</p>
                  <p className="text-xs font-black uppercase tracking-tight">Standard Express</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold italic uppercase">{order.shippingAddress?.neighborhood}</p>
                </div>
              </div>
              <div className="bg-[#FAFAFA] p-6 rounded-[2.5rem] flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <ShoppingBag size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Statut Paiement</p>
                  <p className="text-xs font-black uppercase tracking-tight">{order.paymentMethod === 'COD' ? 'Cash On Delivery' : 'Validé'}</p>
                  <p className="text-[10px] text-indigo-500 mt-1 font-bold uppercase tracking-widest">Sécurisé</p>
                </div>
              </div>
            </div>

            {/* LISTE DES ARTICLES */}
            <div className="space-y-4">
               <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Détails des articles</h4>
               {order.items?.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-black">x{item.quantity}</div>
                      <span className="text-[11px] font-bold uppercase tracking-wider">{item.product?.name}</span>
                    </div>
                    <span className="text-sm font-black italic">{item.price?.toLocaleString()} F</span>
                 </div>
               ))}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-50 flex justify-between items-end">
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total payé</p>
                  <p className="text-4xl md:text-5xl font-[1000] italic tracking-tighter leading-none">
                    {order.totalAmount?.toLocaleString()} <span className="text-xs md:text-sm not-italic uppercase text-indigo-600 ml-1">CFA</span>
                  </p>
               </div>
               <div className="hidden md:block">
                  <MapPin size={40} className="text-gray-100" />
               </div>
            </div>
          </div>
        </div>

        {/* ACTIONS FINALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            to="/shop" 
            className="p-6 bg-white border border-gray-100 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-center hover:bg-black hover:text-white transition-all shadow-sm"
          >
            Continuer le shopping
          </Link>
          <Link 
            to={`/track-order?order=${order.orderNumber}&phone=${order.shippingAddress?.phone}`}
            className="p-6 bg-indigo-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-center hover:bg-black transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
          >
            Suivre mon colis <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;