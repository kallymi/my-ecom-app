import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  Printer
} from 'lucide-react';

const OrderConfirmation = () => {
  const location = useLocation();
  const { order } = location.state || {};

  // const handlePrint = () => window.print();

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold uppercase mb-4">
            Commande introuvable
          </h2>
          <Link 
            to="/shop" 
            className="text-indigo-600 text-sm font-medium"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-10 pb-20 px-3 sm:px-6 print:bg-white print:pt-0">
      <div className="max-w-4xl mx-auto min-w-0">

        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-12 print:hidden">

          <div className="relative mb-6">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl">
              <CheckCircle size={28} className="text-indigo-400" />
            </div>
          </div>

          <h1 className="
            text-[clamp(1.8rem,6vw,3.5rem)]
            font-extrabold uppercase tracking-tight leading-tight
          ">
            Merci <br />
            <span className="text-indigo-600">client.</span>
          </h1>

        </div>

        {/* CARD */}
        <div className="
          bg-white rounded-3xl border border-gray-100 
          shadow-sm overflow-hidden mb-6
          print:shadow-none print:border-none print:rounded-none
        ">

          <div className="p-5 sm:p-8">

            {/* HEADER FACTURE */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b">

              <div>
                <p className="text-gray-400 text-xs uppercase">
                  Transaction
                </p>
                <h3 className="text-lg sm:text-xl font-bold">
                  {order.orderNumber}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* <button 
                onClick={handlePrint}
                className="print:hidden flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-sm hover:bg-black hover:text-white transition"
              >
                <Printer size={16} />
                Imprimer
              </button> */}

            </div>

            {/* INFOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

              <div className="bg-gray-50 p-4 rounded-xl text-sm">
                <p className="text-gray-400 text-xs mb-1">Livraison</p>
                <p className="font-medium">
                  {order.shippingAddress?.neighborhood}
                </p>
                <p className="text-gray-500 text-xs">
                  {order.shippingAddress?.addressDetails}
                </p>
                <p className="text-indigo-600 text-xs mt-1">
                  {order.shippingAddress?.phone}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl text-sm">
                <p className="text-gray-400 text-xs mb-1">Paiement</p>
                <p className="font-medium">
                  {order.paymentMethod === 'COD'
                    ? 'Paiement à la livraison'
                    : 'Paiement digital'}
                </p>
                <p className="text-green-600 text-xs mt-1">
                  Sécurisé
                </p>
              </div>

            </div>

            {/* ITEMS */}
            <div className="space-y-4">

              {order.items?.map((item, idx) => {
                const product = item.product;
                const image = product?.images?.[0]?.url || item.image || "https://via.placeholder.com/150";
                const name = product?.name || item.name || "Produit";
                const price = item.unitPrice || item.price || 0;

                return (
                  <div key={idx} className="flex justify-between items-center border-b pb-3">

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                        <img 
                          src={image}
                          alt={name}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} × {price.toLocaleString()} F
                        </p>
                      </div>

                    </div>

                    <span className="font-semibold">
                      {(price * item.quantity).toLocaleString()} F
                    </span>

                  </div>
                );
              })}

            </div>

            {/* TOTAL */}
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold">
                {order.totalAmount?.toLocaleString()} 
                <span className="text-indigo-600 ml-1">F</span>
              </p>
            </div>

          </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">

          <Link 
            to="/shop"
            className="p-4 bg-white border rounded-xl text-center text-sm hover:bg-black hover:text-white transition"
          >
            Continuer mes achats
          </Link>

          <Link 
            to={`/track-order?order=${order.orderNumber}&phone=${order.shippingAddress?.phone}`}
            className="p-4 bg-indigo-600 text-white rounded-xl text-center text-sm flex items-center justify-center gap-2 hover:bg-black transition"
          >
            Suivre mon colis <ArrowRight size={16} />
          </Link>

        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;