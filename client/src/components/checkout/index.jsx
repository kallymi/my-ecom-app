import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Ajout de useLocation
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowLeft, User, Phone, MapPin, Truck, 
  ChevronRight, Home, ShieldCheck 
} from "lucide-react";

import { CheckoutInput } from "./CheckoutInput";
import { OrderSummary } from "./OrderSummary";
import SuccessScreen from "./SuccessScreen";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Pour récupérer l'achat direct
  const { cart, checkout, loading, cartTotal, totalSavings } = useCart();
  const { user } = useAuth();

  // --- LOGIQUE ACHAT DIRECT (GUEST OU LOGGED) ---
  // On vérifie si l'utilisateur arrive via le bouton "Acheter maintenant"
  const directItem = location.state?.directItem || null;
  const isDirectBuy = !!directItem;

  // Calcul du total spécifique à l'achat direct
  const displayTotal = isDirectBuy 
    ? (directItem.finalPrice || directItem.price) * directItem.quantity 
    : cartTotal;

  const displayCart = isDirectBuy ? [directItem] : cart;

  // 1. ÉTATS DU FORMULAIRE
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    neighborhood: user?.neighborhood || "",
    addressDetails: "",
  });

  // 2. VALIDATION
  const isShippingValid = useMemo(() => (
    shippingInfo.fullName.trim().length >= 3 &&
    shippingInfo.phone.trim().length >= 8 &&
    shippingInfo.neighborhood.trim().length >= 2
  ), [shippingInfo]);

  // 3. LOGIQUE D'ENVOI
  const handleFinalOrder = async () => {
    try {
      const orderData = {
        shippingAddress: shippingInfo,
        paymentMethod: paymentMethod,
        // Si achat direct, on envoie l'item spécifique, sinon le backend prendra le panier de l'utilisateur
        ...(isDirectBuy && {
          items: [{
            product: directItem._id,
            quantity: directItem.quantity,
            price: directItem.finalPrice || directItem.price
          }],
          isDirectOrder: true // Flag pour aider ton backend
        })
      };

      const res = await checkout(orderData);
      
      if (res && (res.success || res._id)) { 
        setIsSuccess(true);
        toast.success("Commande validée !");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la commande ")
      console.error("Erreur checkout:", error);
    }
  };

  // 4. SÉCURITÉ : REDIRECTION
  useEffect(() => {
    if (!loading && !isSuccess && !isDirectBuy && cart.length === 0) {
      navigate("/shop");
    }
  }, [cart, isSuccess, loading, navigate, isDirectBuy]);

  if (isSuccess) {
    return (
      <SuccessScreen 
        onNavigate={() => user ? navigate("/my-orders") : navigate("/")} 
        customerPhone={shippingInfo.phone} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] pb-10">
      <header className="pt-6 px-4 mb-4 max-w-7xl mx-auto flex items-center justify-between">
        <button 
          onClick={() => step === 2 ? setStep(1) : navigate(-1)} 
          className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex gap-2">
           <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
           <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7">
            <h1 className="text-4xl md:text-7xl font-[1000] tracking-tight uppercase italic leading-[0.85] mb-10">
              {isDirectBuy ? "Achat" : "Finaliser"} <br />
              <span className="text-indigo-600">{isDirectBuy ? "Rapide." : "L'achat."}</span>
            </h1>

            {step === 1 ? (
              <section className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-black/5 animate-in fade-in slide-in-from-left-4">
                <div className="flex items-center gap-3 mb-8">
                   <span className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black italic">01</span>
                   <h2 className="text-2xl font-[1000] uppercase italic tracking-tighter">Livraison</h2>
                </div>
                
                <div className="space-y-5">
                  <CheckoutInput 
                    label="Nom complet" 
                    icon={<User size={18}/>} 
                    value={shippingInfo.fullName} 
                    onChange={v => setShippingInfo({...shippingInfo, fullName: v})} 
                  />

                  <CheckoutInput 
                    label="Téléphone" 
                    icon={<Phone size={18}/>} 
                    type="tel"
                    value={shippingInfo.phone} 
                    onChange={v => setShippingInfo({...shippingInfo, phone: v})} 
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <CheckoutInput 
                      label="Quartier" 
                      icon={<MapPin size={18}/>} 
                      value={shippingInfo.neighborhood} 
                      onChange={v => setShippingInfo({...shippingInfo, neighborhood: v})} 
                    />
                    <CheckoutInput 
                      label="Précisions" 
                      icon={<Home size={18}/>} 
                      value={shippingInfo.addressDetails} 
                      onChange={v => setShippingInfo({...shippingInfo, addressDetails: v})} 
                    />
                  </div>

                  <button 
                    disabled={!isShippingValid} 
                    onClick={() => setStep(2)} 
                    className="w-full mt-4 bg-black text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] disabled:opacity-20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Passer au paiement <ChevronRight size={16} />
                  </button>
                </div>
              </section>
            ) : (
              <section className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-black/5 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 mb-8">
                   <span className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-black italic">02</span>
                   <h2 className="text-2xl font-[1000] uppercase italic tracking-tighter">Paiement</h2>
                </div>

                <div className="space-y-6">
                   <PaymentOption 
                     active={paymentMethod === "COD"} 
                     onClick={() => setPaymentMethod("COD")} 
                     title="Payer à la livraison" 
                     description="Paiement cash ou téléphone à la réception"
                     icon={<Truck size={22}/>} 
                   />

                   <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
                      <div className="flex gap-4 items-center">
                        <ShieldCheck className="text-indigo-600" size={24} />
                        <p className="text-[10px] font-bold uppercase text-indigo-900/60 leading-relaxed tracking-wide">
                          Paiement 100% sécurisé à la réception.<br />
                          <span className="text-indigo-600 font-black italic">Livraison Express en cours.</span>
                        </p>
                      </div>
                   </div>

                   <button 
                    disabled={loading} 
                    onClick={handleFinalOrder} 
                    className="w-full bg-indigo-600 text-white py-7 rounded-[2rem] font-[1000] uppercase text-xs tracking-[0.3em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                   >
                    {loading ? "Confirmation..." : "Confirmer la commande"}
                   </button>
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-5">
             <OrderSummary 
               cart={displayCart} 
               cartTotal={displayTotal} 
               totalSavings={isDirectBuy ? 0 : totalSavings} // Ajuste selon tes besoins
             />
          </div>
        </div>
      </main>
    </div>
  );
};
// ... le reste de ton composant PaymentOption reste identique

// --- SOUS-COMPOSANT OPTION DE PAIEMENT ---
const PaymentOption = ({ active, onClick, title, description, icon }) => (
  <div 
    onClick={onClick} 
    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 flex items-center justify-between group ${
      active ? "border-indigo-600 bg-white shadow-xl shadow-indigo-100" : "border-gray-100 bg-gray-50/50 hover:border-gray-200"
    }`}
  >
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
        active ? "bg-indigo-600 text-white" : "bg-white text-black/20 border border-gray-100"
      }`}>
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-[1000] uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-[9px] font-bold text-black/30 uppercase tracking-tighter">{description}</p>
      </div>
    </div>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
      active ? "border-indigo-600" : "border-gray-200"
    }`}>
      {active && <div className="w-3 h-3 bg-indigo-600 rounded-full animate-in zoom-in duration-300" />}
    </div>
  </div>
);

export default Checkout;