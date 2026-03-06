import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, User, Phone, MapPin, Truck, CreditCard, ChevronRight } from "lucide-react";

import { CheckoutInput } from "./CheckoutInput";
import { OrderSummary } from "./OrderSummary"
import SuccessScreen from "./SuccessScreen";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, checkout, loading, cartTotal, totalSavings } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    neighborhood: "",
  });

  const isShippingValid = useMemo(() => (
    shippingInfo.fullName.trim().length >= 3 &&
    shippingInfo.phone.trim().length >= 8 &&
    shippingInfo.neighborhood.trim().length >= 3
  ), [shippingInfo]);

  const handleFinalOrder = async () => {
    try {
      // On lance la commande
      const res = await checkout({ ...shippingInfo, city: "N'Djamena" }, paymentMethod);
      
      if (res) { 
        // IMPORTANT : On déclenche le succès AVANT toute autre logique
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      toast.error("Erreur lors de la commande");
    }
  };

  // --- LOGIQUE DE REDIRECTION SÉCURISÉE ---
  // On ne redirige vers le panier QUE si le panier est vide ET qu'on n'est PAS en succès
  // Et on attend que le composant ait fini de charger (loading est false)
  if (cart.length === 0 && !isSuccess && !loading) {
    navigate("/cart");
    return null;
  }

  // SI SUCCÈS : On affiche uniquement l'écran de succès
  if (isSuccess) {
    return (
      <SuccessScreen 
        onNavigate={() => navigate("/my-orders")} 
        customerPhone={shippingInfo.phone} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] pb-10">
      {/* ... (Reste de ton code Header et Formulaire) ... */}
      <header className="pt-6 md:pt-10 px-4 md:px-6 mb-4 md:mb-10 max-w-7xl mx-auto flex items-center justify-between">
        <button onClick={() => navigate('/cart')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <ArrowLeft size={18} />
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <h1 className="text-3xl md:text-7xl font-[1000] tracking-tight uppercase italic leading-none mb-10">
              Finaliser <span className="text-indigo-600">L'achat.</span>
            </h1>

            {step === 1 ? (
              <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-black/5">
                <div className="flex items-center gap-3 mb-8">
                   <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-black italic">01</span>
                   <h2 className="text-xl font-[1000] uppercase italic">Livraison</h2>
                </div>
                <div className="space-y-4">
                  <CheckoutInput label="Nom complet" icon={<User size={16}/>} value={shippingInfo.fullName} onChange={v => setShippingInfo({...shippingInfo, fullName: v})} />
                  <CheckoutInput label="Téléphone" icon={<Phone size={16}/>} value={shippingInfo.phone} onChange={v => setShippingInfo({...shippingInfo, phone: v})} />
                  <CheckoutInput label="Quartier" icon={<MapPin size={16}/>} value={shippingInfo.neighborhood} onChange={v => setShippingInfo({...shippingInfo, neighborhood: v})} />
                  <button disabled={!isShippingValid} onClick={() => setStep(2)} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-20">Suivant</button>
                </div>
              </section>
            ) : (
              <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-black/5">
                <div className="flex items-center gap-3 mb-8">
                   <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-black italic">02</span>
                   <h2 className="text-xl font-[1000] uppercase italic">Paiement</h2>
                </div>
                <div className="space-y-4">
                   <PaymentOption active={paymentMethod === "COD"} onClick={() => setPaymentMethod("COD")} title="Payer à la livraison" icon={<Truck size={18}/>} />
                   <button 
                    disabled={loading} 
                    onClick={handleFinalOrder} 
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                   >
                    {loading ? "Chargement..." : "Confirmer ma commande"}
                   </button>
                </div>
              </section>
            )}
          </div>
          <div className="lg:col-span-5">
             <OrderSummary cart={cart} cartTotal={cartTotal} totalSavings={totalSavings} />
          </div>
        </div>
      </main>
    </div>
  );
};

const PaymentOption = ({ active, onClick, title, icon }) => (
  <div 
    onClick={onClick} 
    className={`p-4 md:p-6 rounded-xl md:rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${
      active ? "border-indigo-600 bg-indigo-50/30 shadow-inner" : "border-gray-100 bg-gray-50/50"
    }`}
  >
    <div className="flex items-center gap-3 md:gap-4">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${active ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-black/20"}`}>
        {icon}
      </div>
      <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest">{title}</h4>
    </div>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? "border-indigo-600" : "border-gray-200"}`}>
      {active && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
    </div>
  </div>
);

export default Checkout;