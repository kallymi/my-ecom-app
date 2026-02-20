import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  Truck,
  CreditCard,
  ChevronRight,
  ShoppingBag,
  CheckCircle2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { getMainImage } from "../utils/getMainImage";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, checkout, loading, cartTotal, totalSavings } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    neighborhood: "",
    addressDetails: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Protection : redirection si panier vide
  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      navigate("/cart");
    }
    window.scrollTo(0, 0);
  }, [cart.length, navigate, isSuccess]);

  const isShippingValid =
    shippingInfo.fullName.trim().length > 2 &&
    shippingInfo.phone.trim().length > 7 &&
    shippingInfo.neighborhood.trim().length > 2;

  // ---------------------------------------------------------
  // SOUMISSION DE LA COMMANDE (Corrigée et Complète)
  // ---------------------------------------------------------
  const handleFinalOrder = async () => {
    setError("");

    try {
      const result = await checkout(shippingInfo, paymentMethod);

      console.log("DEBUG RESULTAT CHECKOUT:", result);

      if (result.success) {
        setIsSuccess(true);
        toast.success("Commande validée !");

        // Extraction sécurisée de la référence
        const orderRef = 
          result.order?.orderNumber || 
          result.order?._id || 
          result.orderNumber || 
          result._id;
        
        // On récupère le téléphone pour l'Option A (Tracking)
        const userPhone = shippingInfo.phone;

        if (!orderRef) {
          console.error("ERREUR CRITIQUE : Aucun identifiant trouvé");
          toast.error("Commande validée, mais erreur de redirection");
          return;
        }

        // Redirection vers OrderSuccess avec le téléphone en paramètre URL
        setTimeout(() => {
          navigate(`/order-success/${orderRef}?phone=${userPhone}`);
        }, 2000);
      } else {
        setError(result.message || "Erreur lors de la validation");
        toast.error(result.message || "Erreur lors de la validation");
      }
    } catch (err) {
      console.error("Erreur technique checkout:", err);
      const msg = err.response?.data?.message || "Une erreur serveur est survenue";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 pt-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header de progression */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Checkout<span className="text-indigo-600">.</span>
          </h1>
          
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-black" : "text-gray-300"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 1 ? "bg-black text-white" : "bg-gray-200"}`}>1</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Livraison</span>
            </div>
            <ChevronRight size={14} className="text-gray-300" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-black" : "text-gray-300"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 2 ? "bg-black text-white" : "bg-gray-200"}`}>2</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Paiement</span>
            </div>
          </div>
        </div>

        {/* Overlay de Succès */}
        {isSuccess && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white p-12 rounded-[3.5rem] text-center max-w-sm shadow-2xl">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black uppercase italic mb-4">Reçu !</h2>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                Génération de votre commande...
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-12">
          {/* COLONNE GAUCHE */}
          <div className="lg:col-span-8 space-y-8">
            {error && (
              <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl flex items-center gap-4 text-rose-600">
                <p className="font-black uppercase text-[10px] tracking-widest">{error}</p>
              </div>
            )}

            {/* ÉTAPE 1 : LIVRAISON */}
            <div className={`transition-all duration-500 ${step !== 1 ? "opacity-50 pointer-events-none scale-95" : ""}`}>
              <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg">
                    <Truck size={24} />
                  </div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Infos Livraison</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Nom complet</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        placeholder="Ex: Jean Dupont"
                        value={shippingInfo.fullName}
                        onChange={e => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        placeholder="Ex: 699000000"
                        value={shippingInfo.phone}
                        onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase ml-2 text-gray-400">Quartier / Ville</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        placeholder="Ex: Bastos, Yaoundé"
                        value={shippingInfo.neighborhood}
                        onChange={e => setShippingInfo({ ...shippingInfo, neighborhood: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {step === 1 && (
                  <button
                    disabled={!isShippingValid}
                    onClick={() => setStep(2)}
                    className="w-full mt-10 bg-black text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-600 disabled:opacity-30 transition-all shadow-xl"
                  >
                    Continuer vers Paiement
                  </button>
                )}
              </section>
            </div>

            {/* ÉTAPE 2 : PAIEMENT */}
            <div className={`transition-all duration-500 ${step !== 2 ? "opacity-50 pointer-events-none scale-95" : ""}`}>
              <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-black text-white p-4 rounded-2xl">
                    <CreditCard size={24} />
                  </div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">Mode de Paiement</h2>
                </div>

                <div className="grid gap-4">
                  {[
                    { id: "COD", label: "Paiement à la livraison", sub: "Payez en espèces dès réception" },
                    { id: "MOBILE_MONEY", label: "Mobile Money", sub: "Orange, MTN ou Airtel" }
                  ].map(method => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        paymentMethod === method.id 
                        ? "border-indigo-600 bg-indigo-50/50" 
                        : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <p className="font-black uppercase text-sm">{method.label}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{method.sub}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`}>
                        {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>

                {step === 2 && (
                  <div className="flex flex-col md:flex-row gap-4 mt-10">
                    <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-black py-6 rounded-2xl font-black uppercase text-xs tracking-widest">
                      Retour
                    </button>
                    <button
                      disabled={loading}
                      onClick={handleFinalOrder}
                      className="flex-[2] bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl"
                    >
                      {loading ? "Traitement..." : "Confirmer la commande"}
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* COLONNE DROITE : RÉCAPITULATIF */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[3rem] p-8 sticky top-10 shadow-sm border border-gray-100">
              <h3 className="font-black uppercase italic mb-8 flex items-center gap-3 text-lg">
                <ShoppingBag size={20} className="text-indigo-600" /> Mon Panier
              </h3>

              <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-6">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="relative">
                      <img src={getMainImage(item.product)} alt={item.product.name} className="w-20 h-20 rounded-2xl object-cover bg-gray-50" />
                      <span className="absolute -top-2 -right-2 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">{item.quantity}</span>
                    </div>
                    <div className="flex-1 py-1">
                      <p className="text-[11px] font-black uppercase leading-tight line-clamp-2">{item.product.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-2">{(item.unitPrice || item.product.finalPrice).toLocaleString()} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-dashed space-y-4">
                {totalSavings > 0 && (
                  <div className="flex justify-between items-center text-rose-600 bg-rose-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase">Économie</span>
                    <span className="font-black">-{totalSavings.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between items-end px-2">
                  <span className="text-[10px] font-black uppercase text-gray-400">Total Final</span>
                  <p className="text-3xl font-black">{cartTotal.toLocaleString()} <span className="text-xs">FCFA</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;