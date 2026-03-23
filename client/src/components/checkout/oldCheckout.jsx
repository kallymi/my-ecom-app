import React, { useState, useEffect, useMemo } from "react";
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
  Lock,
  MessageCircle // Pour l'icône WhatsApp
} from "lucide-react";
import { getMainImage } from "../utils/getMainImage";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, checkout, loading, cartTotal, totalSavings } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [showGuestSuccess, setShowGuestSuccess] = useState(false);
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

  // Validation intelligente du formulaire
  const isShippingValid = useMemo(() => {
    return (
      shippingInfo.fullName.trim().length >= 3 &&
      shippingInfo.phone.trim().length >= 8 &&
      shippingInfo.neighborhood.trim().length >= 3
    );
  }, [shippingInfo]);

  // Génération du lien WhatsApp avec détails du panier
  const whatsappLink = useMemo(() => {
    const phoneNumber = "23566268256"; 
    const itemsList = cart.map(item => `• ${item.product.name} (x${item.quantity})`).join('%0A');
    const message = `Bonjour ! Je souhaite commander :%0A%0A${itemsList}%0A%0A💰 *Total : ${cartTotal.toLocaleString()} FCFA*%0A%0A📍 *Infos Livraison :*%0A- Nom : ${shippingInfo.fullName || 'Non précisé'}%0A- Quartier : ${shippingInfo.neighborhood || 'Non précisé'}%0A- Tel : ${shippingInfo.phone || 'Non précisé'}`;
    
    return `https://wa.me/${phoneNumber}?text=${message}`;
  }, [cart, cartTotal, shippingInfo]);

  const handleWhatsAppOrder = () => {
    if (!isShippingValid) {
      toast.error("Veuillez remplir vos informations de livraison d'abord");
      setStep(1);
      return;
    }

    // Affiche un message de succès sur le site
    setShowGuestSuccess(true);
    toast.success("Ouverture de WhatsApp...");

    // Ouvre WhatsApp après un léger délai pour laisser le toast apparaître
    setTimeout(() => {
      window.open(whatsappLink, '_blank');
    }, 1000);
  };

  // Remplace ta fonction handleFinalOrder par celle-ci
  const handleFinalOrder = async () => {
    setError("");
    
    // 1. On prépare l'adresse
    const finalShippingAddress = {
      ...shippingInfo,
      city: "N'Djamena",
      addressDetails: shippingInfo.addressDetails || "Aucune précision supplémentaire",
    };

    try {
      // 2. IMPORTANT : Si ton checkout ne prend pas les items, 
      // assure-toi que ton CartContext a bien synchronisé les items avec la DB
      // AVANT d'appeler cette fonction.
      
      const result = await checkout(finalShippingAddress, paymentMethod);
      
      if (result.success) {
        setIsSuccess(true);
        toast.success("Commande enregistrée !");
        setTimeout(() => navigate("/profile/orders"), 2000);
      } else {
        // 3. Affiche l'erreur réelle venant du serveur pour déboguer
        setError(result.message || "Erreur lors de la validation");
        toast.error(result.message || "Erreur serveur");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 pt-6 md:pt-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER & STEPS */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/cart')} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-90">
                <ArrowLeft size={18} />
            </button>
            <h1 className="text-3xl md:text-5xl font-[1000] uppercase tracking-tighter italic">
              Checkout<span className="text-indigo-600">.</span>
            </h1>
          </div>
          
          <div className="flex items-center bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-gray-100 gap-6">
            <div className={`flex items-center gap-3 ${step >= 1 ? "text-indigo-600" : "text-gray-300"}`}>
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-[1000] ${step >= 1 ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-100"}`}>1</span>
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Livraison</span>
            </div>
            <ChevronRight size={14} className="text-gray-200" />
            <div className={`flex items-center gap-3 ${step >= 2 ? "text-indigo-600" : "text-gray-300"}`}>
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-[1000] ${step >= 2 ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-100"}`}>2</span>
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Paiement</span>
            </div>
          </div>
        </div>

        {/* SUCCESS OVERLAY */}
        {isSuccess && (
          <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-500">
            <div className="text-center">
              <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-100 animate-bounce">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-[1000] uppercase tracking-tighter italic">Merci pour votre confiance !</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Redirection vers vos commandes...</p>
            </div>
          </div>
        )}

        {showGuestSuccess && (
          <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="max-w-sm">
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-[1000] text-white uppercase italic tracking-tighter">Action Reçue !</h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-4 leading-relaxed">
                Nous vous avons redirigé vers WhatsApp.<br/>
                <span className="text-emerald-400">Envoyez le message pré-rempli</span> pour finaliser avec un agent.
              </p>
              <button 
                onClick={() => {
                    setShowGuestSuccess(false);
                    navigate('/');
                }}
                className="mt-8 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] border-b border-indigo-400 pb-1"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-10">
          {/* GAUCHE : FORMULAIRES */}
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 font-black text-[10px] uppercase tracking-widest">
                {error}
              </div>
            )}

            {/* SECTION LIVRAISON */}
            <div className={`${step !== 1 ? "hidden md:block opacity-40 grayscale pointer-events-none" : ""}`}>
              <section className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-50">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl"><Truck size={20} /></div>
                    <h2 className="text-xl font-[1000] uppercase tracking-tight">Adresse de livraison</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[9px] font-black uppercase ml-2 text-gray-400">Nom & Prénoms</label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={17} />
                        <input
                          placeholder="EX: MARC ALAIN"
                          value={shippingInfo.fullName}
                          onChange={e => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl font-bold text-xs uppercase tracking-wider outline-none border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase ml-2 text-gray-400">Téléphone</label>
                      <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={17} />
                        <input
                          placeholder="66XXXXXX"
                          value={shippingInfo.phone}
                          onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl font-bold text-xs outline-none border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase ml-2 text-gray-400">Quartier / Ville</label>
                      <div className="relative group">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={17} />
                        <input
                          placeholder="EX: SABANGALI"
                          value={shippingInfo.neighborhood}
                          onChange={e => setShippingInfo({ ...shippingInfo, neighborhood: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl font-bold text-xs uppercase outline-none border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {step === 1 && (
                  <button
                    disabled={!isShippingValid}
                    onClick={() => setStep(2)}
                    className="w-full mt-8 bg-black text-white py-5 rounded-[2rem] font-[1000] uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-600 disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    Choisir le paiement <ChevronRight size={16} />
                  </button>
                )}
              </section>
            </div>

            {/* SECTION PAIEMENT */}
            <div className={`${step !== 2 ? "hidden md:block opacity-40 grayscale pointer-events-none" : ""}`}>
              <section className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-black text-white p-3 rounded-xl shadow-lg"><CreditCard size={20} /></div>
                  <h2 className="text-xl font-[1000] uppercase tracking-tight">Mode de règlement</h2>
                </div>

                <div className="grid gap-3 mb-8">
                  {[
                    { id: "COD", label: "Cash à la livraison", sub: "Payez quand vous recevez", icon: Truck },
                    { id: "MOBILE_MONEY", label: "Mobile Money", sub: "Paiement direct sécurisé", icon: CreditCard }
                  ].map(method => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`group p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all flex items-center justify-between ${
                        paymentMethod === method.id ? "border-indigo-600 bg-indigo-50/20" : "border-gray-100 bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${paymentMethod === method.id ? "bg-indigo-600 text-white" : "bg-white text-gray-300"}`}>
                          <method.icon size={18} />
                        </div>
                        <div>
                          <p className="font-black uppercase text-[10px] tracking-wider">{method.label}</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{method.sub}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? "border-indigo-600 bg-indigo-600" : "border-gray-200"}`}>
                        {paymentMethod === method.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>

                {step === 2 && (
                  <div className="space-y-4">
                    <button
                      disabled={loading}
                      onClick={handleFinalOrder}
                      className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-[1000] uppercase text-[11px] tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3"
                    >
                      {loading ? "Traitement..." : "Confirmer ma commande"}
                      <CheckCircle2 size={18} />
                    </button>

                    <div className="relative py-2 flex items-center justify-center">
                       <span className="absolute inset-x-0 h-[1px] bg-gray-100"></span>
                       <span className="relative bg-white px-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Ou</span>
                    </div>

                    <button
                      onClick={handleWhatsAppOrder}
                      className="w-full bg-[#25D366] text-white py-5 rounded-[2rem] font-[1000] uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-50"
                    >
                      <MessageCircle size={18} />
                      Commander par WhatsApp
                    </button>

                    <button onClick={() => setStep(1)} className="w-full text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors">
                      Modifier l'adresse
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* DROITE : RECAPITULATIF */}
          <div className="lg:col-span-5">
            <div className="bg-black text-white rounded-[3rem] p-8 md:p-10 sticky top-10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-[1000] uppercase italic text-xl tracking-tighter italic">Récapitulatif</h3>
                <ShoppingBag size={20} className="text-indigo-400" />
              </div>

              <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto no-scrollbar">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="relative shrink-0">
                      <img src={getMainImage(item.product)} alt={item.product.name} className="w-14 h-16 rounded-xl object-cover bg-white/5" />
                      <span className="absolute -top-2 -right-2 bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shadow-xl ring-2 ring-black">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-tight text-gray-200 truncate">{item.product.name}</p>
                      <p className="text-xs font-[1000] text-indigo-400 italic">{(item.unitPrice || item.product.finalPrice).toLocaleString()} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                {totalSavings > 0 && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="text-[9px] font-black uppercase tracking-widest">Économie</span>
                    <span className="font-black text-xs">-{totalSavings.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-gray-500 tracking-[0.3em] mb-1">Total TTC</span>
                    <p className="text-4xl font-[1000] tracking-tighter text-white">
                      {cartTotal.toLocaleString()} 
                      <span className="text-[10px] font-black italic text-indigo-500 ml-1 tracking-normal">FCFA</span>
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Lock size={14} className="text-indigo-400" />
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        Transaction sécurisée. Vos données sont protégées.
                    </p>
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