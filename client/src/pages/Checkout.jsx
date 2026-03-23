import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Lock, ShieldCheck, MapPin, Phone, User } from "lucide-react";
import { getMainImage } from "../utils/getMainImage";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, checkout, loading, cartTotal, totalSavings } = useCart();
  const { user } = useAuth();

  const [error, setError] = useState("");
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    neighborhood: "",
    addressDetails: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    if (cart.length === 0) navigate("/cart");
    window.scrollTo(0, 0);
  }, [cart.length, navigate]);

  const isShippingValid = useMemo(() => {
    return (
      shippingInfo.fullName.trim().length >= 3 &&
      shippingInfo.phone.trim().length >= 8 &&
      shippingInfo.neighborhood.trim().length >= 3
    );
  }, [shippingInfo]);

  const whatsappLink = useMemo(() => {
    const phone = "23566268256";
    const items = cart.map(i => `• ${i.product.name} (x${i.quantity})`).join("%0A");
    const msg = `Bonjour, je souhaite finaliser ma commande :%0A%0A${items}%0A%0A💰 Total : ${cartTotal.toLocaleString()} FCFA`;
    return `https://wa.me/${phone}?text=${msg}`;
  }, [cart, cartTotal]);

  const handleFinalOrder = async () => {
    setError("");
    const address = {
      ...shippingInfo,
      city: "N'Djamena",
      addressDetails: shippingInfo.addressDetails || "Aucune précision",
    };

    try {
      const result = await checkout(address, paymentMethod);
      if (result.success) {
        toast.success("Commande validée !");
        navigate("/profile/orders");
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch {
      setError("Erreur serveur");
    }
  };

  return (
    <div className="min-h-screen bg-white py-4 md:py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER MINIMALISTE */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition">
            <ArrowLeft size={20} className="text-slate-900" />
          </button(cite: 1)>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 italic">
            Finaliser <span className="text-indigo-600">l'achat.</span>
          </h1>
          <div className="w-10" />
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* SECTION GAUCHE : FORMULAIRE */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* ETAPE 01 : LIVRAISON */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-slate-900 text-white rounded-full text-xs font-black">01</span>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Livraison</h2>
              </div>

              <div className="grid gap-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                <div className="relative">
                  <User className="absolute left-4 top-4 text-slate-400" size={18} />
                  <input
                    placeholder="Nom complet"
                    value={shippingInfo.fullName}
                    onChange={e => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 text-slate-400" size={18} />
                    <input
                      placeholder="Téléphone"
                      value={shippingInfo.phone}
                      onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                    <input
                      placeholder="Quartier"
                      value={shippingInfo.neighborhood}
                      onChange={e => setShippingInfo({ ...shippingInfo, neighborhood: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ETAPE 02 : PAIEMENT */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-slate-900 text-white rounded-full text-xs font-black">02</span>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Paiement</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { id: "COD", label: "À la livraison", desc: "Payez cash à l'arrivée" },
                  { id: "MOBILE_MONEY", label: "Mobile Money", desc: "Airtel / Moov Money" },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-6 rounded-[2rem] text-left transition-all border-2 ${
                      paymentMethod === m.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <p className="font-black text-slate-900">{m.label}</p>
                    <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* BOUTONS D'ACTION FINALE */}
            <div className="pt-6 space-y-4">
              <button
                disabled={!isShippingValid || loading}
                onClick={handleFinalOrder}
                className="w-full bg-slate-950 text-white py-6 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-95 disabled:opacity-20"
              >
                {loading ? "Validation..." : `Confirmer la commande • ${cartTotal.toLocaleString()} F`}
              </button>

              <button
                onClick={() => window.open(whatsappLink)}
                className="w-full bg-[#25D366]/10 text-[#128C7E] py-5 rounded-full font-black uppercase tracking-widest text-[10px] border-2 border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all flex items-center justify-center gap-2"
              >
                <Phone size={14} /> Passer via WhatsApp
              </button>
            </div>
          </div>

          {/* SECTION DROITE : RÉSUMÉ NOIR (STYLE PANIER PHOTO) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950 text-white p-8 rounded-[3rem] shadow-2xl lg:sticky lg:top-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black italic tracking-tighter uppercase">Panier</h3>
                <span className="bg-indigo-600 text-[10px] px-2 py-1 rounded-md font-black">{cart.length}</span>
              </div>

              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="relative">
                      <img
                        src={getMainImage(item.product)}
                        className="w-16 h-16 object-cover rounded-2xl bg-white/10"
                        alt=""
                      />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate uppercase tracking-tight">{item.product.name}</p>
                      <p className="text-xs text-slate-400 font-medium">
                        {(item.unitPrice || item.product.finalPrice).toLocaleString()} F
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
                {totalSavings > 0 && (
                  <div className="flex justify-between items-center bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Économie Cheel.</span>
                    <span className="text-sm font-black text-indigo-400">-{totalSavings.toLocaleString()} FCFA</span>
                  </div>
                )}

                <div className="flex justify-between items-end pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Total TTC</span>
                  <div className="text-right">
                    <p className="text-4xl font-black tracking-tighter leading-none">
                      {cartTotal.toLocaleString()}<span className="text-sm ml-1 text-indigo-500 italic uppercase">fcfa</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl mt-4">
                  <ShieldCheck className="text-indigo-500" size={20} />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-tight">
                    Transaction sécurisée.<br/>Expédition immédiate à <span className="text-white">N'Djamena</span>.
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