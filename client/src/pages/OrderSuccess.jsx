import React, { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  CheckCircleIcon,
  TruckIcon,
  ClipboardDocumentIcon,
  PrinterIcon,
  ShoppingBagIcon,
  PhoneIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import api from "../api/axios";
import toast from "react-hot-toast";

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get("phone");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/track/${orderNumber}?phone=${phone}`);
        setOrder(data.order || data);
      } catch (err) {
        console.error("Erreur tracking :", err);
        toast.error("Détails introuvables");
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber && phone) fetchOrder();
  }, [orderNumber, phone]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
             <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[9px]">Validation du reçu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen py-12 md:py-24 px-4">
      <div className="max-w-xl mx-auto">
        
        {/* CARTE TICKET PRINCIPALE */}
        <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-700">
          
          {/* Header Succès */}
          <div className="bg-indigo-600 p-10 md:p-14 text-center text-white relative overflow-hidden">
            {/* Décoration de fond */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative">
                <div className="bg-white/20 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                    <CheckCircleIcon className="h-10 w-10 text-white animate-in slide-in-from-bottom-2 duration-1000" />
                </div>
                <h1 className="text-3xl md:text-4xl font-[1000] uppercase tracking-tighter leading-none italic">
                  Commande <br /> Confirmée !
                </h1>
                <p className="mt-4 font-black opacity-60 uppercase text-[9px] tracking-[0.3em]">
                  Merci pour votre confiance
                </p>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-10">
            
            {/* RÉFÉRENCE STYLE BADGE */}
            <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Référence unique</span>
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-[1000] tracking-tighter text-black uppercase">{orderNumber}</span>
                    <button
                        onClick={() => {
                        navigator.clipboard.writeText(orderNumber);
                        toast.success("Copié !");
                        }}
                        className="p-2 hover:bg-white rounded-lg transition-all text-indigo-600 shadow-sm"
                    >
                        <ClipboardDocumentIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* TIMELINE ÉTAPES */}
            <div className="space-y-8">
                <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 text-center">Prochaines étapes</h4>
                
                <div className="flex gap-6 items-start">
                    <div className="shrink-0 bg-indigo-50 p-4 rounded-2xl">
                        <PhoneIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-tight mb-1">Confirmation par appel</p>
                        <p className="text-gray-500 text-[11px] leading-relaxed font-medium">
                            Un agent va vous appeler au <span className="text-black font-bold">{phone}</span> pour valider votre position exacte.
                        </p>
                    </div>
                </div>

                <div className="flex gap-6 items-start">
                    <div className="shrink-0 bg-emerald-50 p-4 rounded-2xl">
                        <TruckIcon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-tight mb-1">Livraison express</p>
                        <p className="text-gray-500 text-[11px] leading-relaxed font-medium">
                            Votre colis est en cours de préparation pour <span className="text-black font-bold uppercase">{order?.shippingAddress?.neighborhood || "votre quartier"}</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* RÉSUMÉ FINANCIER */}
            <div className="pt-8 border-t border-gray-100">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total réglé</p>
                        <p className="text-3xl font-[1000] tracking-tighter">
                            {order?.totalAmount?.toLocaleString()} <small className="text-sm italic text-gray-400">FCFA</small>
                        </p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">
                        Paiement à la livraison
                    </div>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="grid grid-cols-1 gap-4 pt-4">
              <Link
                to="/shop"
                className="w-full bg-black text-white py-6 rounded-3xl font-[1000] uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95"
              >
                Continuer le shopping <ArrowRightIcon className="h-4 w-4" />
              </Link>

              <button
                onClick={() => window.print()}
                className="w-full bg-white text-gray-400 py-4 rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] hover:text-black transition-all flex items-center justify-center gap-2"
              >
                <PrinterIcon className="h-4 w-4" /> Imprimer mon reçu
              </button>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-12 text-center space-y-2">
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.3em]">Besoin d'aide immédiate ?</p>
            <a href="tel:+23568242448" className="inline-block text-black font-[1000] text-sm hover:text-indigo-600 transition-colors">
                SUPPORT WHATSAPP : +235 68 24 24 48
            </a>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;