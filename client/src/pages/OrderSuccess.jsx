import React, { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  CheckCircleIcon,
  TruckIcon,
  ClipboardDocumentIcon
} from "@heroicons/react/24/outline";
import api from "../api/axios";
import toast from "react-hot-toast";

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get("phone"); // On récupère le téléphone passé dans l'URL

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // On envoie maintenant le téléphone récupéré dans l'URL pour valider le tracking
        const { data } = await api.get(
          `/orders/track/${orderNumber}?phone=${phone}`
        );
        
        // Selon la structure de ton backend, on prend data ou data.order
        setOrder(data.order || data);
      } catch (err) {
        console.error("Erreur tracking commande :", err);
        toast.error("Impossible de charger les détails de la commande.");
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber && phone) {
      fetchOrder();
    } else if (orderNumber && !phone) {
        // Cas de secours si le téléphone est manquant dans l'URL
        console.warn("Téléphone manquant pour le tracking");
        setLoading(false);
    }
  }, [orderNumber, phone]);

  /* ------------------------------
      ÉTAT DE CHARGEMENT
  ------------------------------ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                Chargement de votre reçu...
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">

          {/* Header Succès */}
          <div className="bg-emerald-500 p-12 text-center text-white">
            <CheckCircleIcon className="h-20 w-20 mx-auto mb-4 animate-bounce" />
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              Commande Reçue !
            </h1>
            <p className="mt-2 font-bold opacity-90 uppercase text-[10px] tracking-widest">
              Merci pour votre confiance
            </p>
          </div>

          <div className="p-10">
            {/* Numéro de Commande */}
            <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl mb-8 border-2 border-dashed border-gray-200">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Référence de commande
                </p>
                <p className="text-xl font-black text-indigo-600">
                  {orderNumber}
                </p>
              </div>

              <button
                onClick={() => {
                    navigator.clipboard.writeText(orderNumber);
                    toast.success("Copié !");
                }}
                className="p-3 bg-white rounded-xl shadow-sm hover:text-indigo-600 transition-colors"
                title="Copier la référence"
              >
                <ClipboardDocumentIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Message de Réassurance */}
            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="bg-indigo-100 p-3 rounded-xl h-fit">
                  <TruckIcon className="h-6 w-6 text-indigo-600" />
                </div>

                <div>
                  <h4 className="font-black uppercase text-sm italic">
                    Prochaine étape ?
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Notre équipe prépare votre colis avec soin. Vous recevrez un{" "}
                    <strong>appel téléphonique</strong> au <span className="text-black font-bold">{phone}</span> dans les prochaines
                    heures pour confirmer la livraison à{" "}
                    <strong>
                      {order?.shippingAddress?.neighborhood || "votre adresse"}
                    </strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Récapitulatif Rapide */}
            {order && (
                <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h5 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Résumé</h5>
                    <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-600 uppercase text-xs">Total de la commande</span>
                        <span className="text-lg font-black">{order.totalAmount?.toLocaleString()} FCFA</span>
                    </div>
                </div>
            )}

            {/* Boutons d'Action */}
            <div className="grid grid-cols-1 gap-4">
              <Link
                to="/shop"
                className="w-full bg-black text-white text-center py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-800 transition-all shadow-lg"
              >
                Continuer mes achats
              </Link>

              <button
                onClick={() => window.print()}
                className="w-full bg-white text-gray-400 text-center py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-black transition-all"
              >
                Imprimer le reçu
              </button>
            </div>
          </div>
        </div>

        {/* Footer Support */}
        <p className="text-center mt-12 text-gray-400 text-xs font-bold uppercase tracking-widest">
          Besoin d'aide ? Contactez notre support au{" "}
          <span className="text-black">+237 6XX XX XX XX</span>
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;