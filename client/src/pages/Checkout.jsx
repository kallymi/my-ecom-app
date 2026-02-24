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
  ArrowLeft,
  Lock
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

  const handleFinalOrder = async () => {
    setError("");
    try {
      const result = await checkout(shippingInfo, paymentMethod);
      if (result.success) {
        setIsSuccess(true);
        const orderRef = result.order?.orderNumber || result.order?._id || result._id;
        const userPhone = shippingInfo.phone;

        setTimeout(() => {
          navigate(`/order-success/${orderRef}?phone=${userPhone}`);
        }, 2000);
      } else {
        setError(result.message || "Erreur de validation");
      }
    } catch (err) {
      setError("Une erreur serveur est survenue");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 pt-6 md:pt-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER & STEPPER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/cart')} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all">
                <ArrowLeft size={18} />
            </button>
            <h1 className="text-3xl md:text-5xl font-[1000] uppercase tracking-tighter italic leading-none">
              Checkout<span className="text-indigo-600">.</span>
            </h1>
          </div>
          
          <div className="flex items-center bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-gray-100 gap-6">
            <div className={`flex items-center gap-3 ${step >= 1 ? "text-indigo-600" : "text-gray-300"}`}>
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-[1000] ${step >= 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-gray-100"}`}>1</span>
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Livraison</span>
            </div>
            <ChevronRight size={14} className="text-gray-200" />
            <div className={`flex items-center gap-3 ${step >= 2 ? "text-indigo-600" : "text-gray-300"}`}>
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-[1000] ${step >= 2 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-gray-100"}`}>2</span>
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Paiement</span>
            </div>
          </div>
        </div>

        {/* SUCCESS OVERLAY */}
        {isSuccess && (
          <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="text-center">
              <div className="w-32 h-32 bg-indigo-600 text-white rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200 animate-bounce">
                <CheckCircle2 size={50} />
              </div>
              <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-2">Finalisation...</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Préparation de votre reçu</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-10">
          {/* GAUCHE : FORMULAIRES */}
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-5 rounded-[2rem] flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-4">
                <p className="font-black uppercase text-[10px] tracking-widest">{error}</p>
              </div>
            )}

            {/* ÉTAPE 1 : LIVRAISON */}
            <div className={`transition-all duration-500 ${step !== 1 ? "hidden md:block opacity-40 pointer-events-none grayscale" : ""}`}>
              <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl"><Truck size={20} /></div>
                        <h2 className="text-xl font-[1000] uppercase tracking-tight">Adresse de livraison</h2>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[9px] font-black uppercase ml-2 text-gray-400 tracking-widest">Nom & Prénoms</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input
                        placeholder="VOTRE NOM COMPLET"
                        value={shippingInfo.fullName}
                        onChange={e => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-2xl font-bold text-xs uppercase tracking-wider outline-none border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase ml-2 text-gray-400 tracking-widest">Numéro de téléphone</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input
                        placeholder="699XXXXXX"
                        value={shippingInfo.phone}
                        onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-2xl font-bold text-xs tracking-widest outline-none border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase ml-2 text-gray-400 tracking-widest">Quartier & Ville</label>
                    <div className="relative group">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input
                        placeholder="EX: avenue charle de Gaul, pres du siege de la CNPS"
                        value={shippingInfo.neighborhood}
                        onChange={e => setShippingInfo({ ...shippingInfo, neighborhood: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-2xl font-bold text-xs uppercase tracking-wider outline-none border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {step === 1 && (
                  <button
                    disabled={!isShippingValid}
                    onClick={() => setStep(2)}
                    className="w-full mt-10 bg-black text-white py-6 rounded-[2rem] font-[1000] uppercase text-[11px] tracking-[0.2em] hover:bg-indigo-600 disabled:opacity-20 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                  >
                    Suivant <ChevronRight size={16} />
                  </button>
                )}
              </section>
            </div>

            {/* ÉTAPE 2 : PAIEMENT */}
            <div className={`transition-all duration-500 ${step !== 2 ? "hidden md:block opacity-40 pointer-events-none grayscale" : ""}`}>
              <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-50">
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-black text-white p-3 rounded-xl shadow-lg"><CreditCard size={20} /></div>
                  <h2 className="text-xl font-[1000] uppercase tracking-tight">Méthode de paiement</h2>
                </div>

                <div className="grid gap-4">
                  {[
                    { id: "COD", label: "Paiement à la livraison", sub: "Cash on delivery", icon: Truck },
                    { id: "MOBILE_MONEY", label: "Mobile Money", sub: "Orange / MTN Money", icon: CreditCard }
                  ].map(method => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`group p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${
                        paymentMethod === method.id 
                        ? "border-indigo-600 bg-indigo-50/30" 
                        : "border-gray-100 hover:border-gray-200 bg-gray-50/30"
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-2xl transition-all ${paymentMethod === method.id ? "bg-indigo-600 text-white" : "bg-white text-gray-400 border border-gray-100"}`}>
                            <method.icon size={20} />
                        </div>
                        <div>
                            <p className="font-black uppercase text-[11px] tracking-wider">{method.label}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{method.sub}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === method.id ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`}>
                        {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>

                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                    <button onClick={() => setStep(1)} className="order-2 md:order-1 bg-gray-100 text-black py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all">
                      Retour
                    </button>
                    <button
                      disabled={loading}
                      onClick={handleFinalOrder}
                      className="order-1 md:order-2 md:col-span-2 bg-indigo-600 text-white py-6 rounded-[2rem] font-[1000] uppercase text-[11px] tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3"
                    >
                      {loading ? "Chargement..." : "Confirmer l'achat"}
                      {!loading && <CheckCircle2 size={16} />}
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* DROITE : PANIER RÉCAP */}
          <div className="lg:col-span-5">
            <div className="bg-black text-white rounded-[3rem] p-8 md:p-10 sticky top-10 shadow-2xl">
              <div className="flex items-center justify-between mb-10">
                <h3 className="font-[1000] uppercase italic text-xl tracking-tighter">Votre commande</h3>
                <ShoppingBag size={20} className="text-indigo-400" />
              </div>

              <div className="max-h-[35vh] overflow-y-auto pr-2 space-y-5 custom-scrollbar">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center group">
                    <div className="relative shrink-0">
                      <img src={getMainImage(item.product)} alt={item.product.name} className="w-16 h-20 rounded-2xl object-cover bg-white/5" />
                      <span className="absolute -top-2 -right-2 bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ring-2 ring-black">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-tight leading-tight line-clamp-1 text-gray-200 group-hover:text-white transition-colors">{item.product.name}</p>
                      <p className="text-[11px] font-[1000] mt-1 text-indigo-400 italic">{(item.unitPrice || item.product.finalPrice).toLocaleString()} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-white/10 space-y-5">
                {totalSavings > 0 && (
                  <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400">
                    <span className="text-[9px] font-black uppercase tracking-widest">Promotion</span>
                    <span className="font-black text-xs">-{totalSavings.toLocaleString()} FCFA</span>
                  </div>
                )}
                
                <div className="flex justify-between items-end px-2 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em] mb-1">Montant à payer</span>
                    <p className="text-4xl font-[1000] tracking-tighter text-white">{cartTotal.toLocaleString()} <span className="text-xs font-black italic text-indigo-500">FCFA</span></p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                    <Lock size={14} className="text-indigo-400" />
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Paiement sécurisé et vérifié par notre service logistique.</p>
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