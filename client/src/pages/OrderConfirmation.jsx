import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  ArrowRight, 
  Printer, // Remplacé Download par Printer pour plus de clarté
  Share2, 
  ShoppingBag,
  MapPin
} from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const { order } = location.state || {};

  const handlePrint = () => {
    window.print();
  };

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
    <div className="min-h-screen bg-[#FAFAFA] pt-12 pb-24 px-4 print:bg-white print:pt-0">
      <div className="max-w-3xl mx-auto">
        
        {/* HEADER - Caché à l'impression */}
        <div className="flex flex-col items-center text-center mb-16 print:hidden">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-black rounded-[2.2rem] md:rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
              <CheckCircle size={40} className="text-indigo-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-7xl font-[1000] tracking-tighter italic uppercase leading-none mb-4">
            MERCI <br /> <span className="text-indigo-600">CLIENT.</span>
          </h1>
        </div>

        {/* CARTE PRINCIPALE - Format Facture à l'impression */}
        <div className="bg-white rounded-[3rem] md:rounded-[4rem] border border-gray-50 shadow-sm overflow-hidden mb-8 print:shadow-none print:border-none print:rounded-none">
          <div className="p-8 md:p-12">
            
            {/* Header Facture */}
            <div className="flex justify-between items-start mb-12 pb-8 border-b border-gray-50">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Numéro de transaction</p>
                <h3 className="text-xl font-[1000] italic uppercase tracking-tighter">#{order.orderNumber}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                  Date: {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              {/* Bouton Imprimer - Caché à l'impression */}
              <div className="flex gap-3 print:hidden">
                <button 
                  onClick={handlePrint}
                  className="p-4 bg-gray-50 rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
                >
                  <Printer size={18} /> Imprimer Reçu
                </button>
              </div>

              {/* Logo Facture - Visible uniquement à l'impression */}
              <div className="hidden print:block text-right">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">MaBoutique<span className="text-indigo-600">.</span></h2>
                <p className="text-[8px] font-bold text-gray-400 uppercase">Facture Officielle</p>
              </div>
            </div>

            {/* INFO CLIENT & LIVRAISON */}
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="bg-[#FAFAFA] p-6 rounded-[2.5rem] print:bg-white print:border print:border-gray-100">
                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Destinataire</p>
                 <p className="text-xs font-black uppercase italic">{order.shippingAddress?.neighborhood}</p>
                 <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 leading-tight">{order.shippingAddress?.addressDetails}</p>
                 <p className="text-[10px] text-indigo-600 font-black mt-2">{order.shippingAddress?.phone}</p>
              </div>
              <div className="bg-[#FAFAFA] p-6 rounded-[2.5rem] print:bg-white print:border print:border-gray-100">
                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Methode de Paiement</p>
                 <p className="text-xs font-black uppercase italic">{order.paymentMethod === 'COD' ? 'Paiement a la livraison' : 'Paiement Digital'}</p>
                 <p className="text-[10px] text-green-600 font-black mt-1 uppercase tracking-widest">Transaction Sécurisée</p>
              </div>
            </div>
        
            {/* LISTE DES ARTICLES AVEC IMAGES */}
            <div className="space-y-6">
              <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Détails de la commande</h4>
              {order.items?.map((item, idx) => {
                // 🛡️ LOGIQUE D'AFFICHAGE ROBUSTE
                // On cherche l'image soit dans le populate, soit dans le snapshot 'image' créé par le controller
                const productDetail = item.product; 
                const itemImage = productDetail?.images?.[0]?.url || productDetail?.image || item.image || 'https://via.placeholder.com/150';
                const itemName = productDetail?.name || item.name || "Article sans nom";
                const itemPrice = item.unitPrice || item.price || 0;

                return (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-4">
                      {/* Image Produit */}
                      <div className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0 print:border-gray-200">
                        <img 
                          src={itemImage} 
                          alt={itemName}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[11px] font-[1000] uppercase tracking-tighter italic leading-tight">
                          {itemName}
                        </span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">
                          Qté: {item.quantity} x {itemPrice.toLocaleString()} F
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-sm font-black italic">
                      {(itemPrice * item.quantity).toLocaleString()} F
                    </span>
                  </div>
                );
              })}
            </div>

            {/* TOTAL FINAL */}
            <div className="mt-10 pt-8 border-t-2 border-black flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Montant Total Payé</p>
                <p className="text-4xl font-[1000] italic tracking-tighter leading-none">
                  {order.totalAmount?.toLocaleString()} <span className="text-xs not-italic uppercase text-indigo-600 ml-1">CFA</span>
                </p>
              </div>
              <div className="text-right print:block hidden">
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-300 italic">Signature / Cachet</p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS - Caché à l'impression */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
          <Link to="/shop" className="p-6 bg-white border border-gray-100 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-center hover:bg-black hover:text-white transition-all shadow-sm">
            Boutique
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