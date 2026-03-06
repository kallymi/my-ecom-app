import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { getMainImage } from "../utils/getMainImage";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    totalItems,
    totalSavings,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    neighborhood: "",
    addressDetails: "",
  });

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // FONCTION DE COMMANDE MODIFIÉE
  const submitQuickOrder = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.neighborhood) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }

    setLoading(true);
    const orderData = {
      shippingAddress: formData,
      paymentMethod: "COD",
      isGuest: true,
      items: cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.finalPrice || item.product.price
      }))
    };

    try {
      const { data } = await api.post("/orders", orderData);
      if (data?.success) {
        // 1. ON VIDE LE PANIER
        clearCart();
        // 2. ON REDIRIGE VERS LA CONFIRMATION AVEC LES INFOS DE COMMANDE
        navigate("/order-confirmation", { 
          state: { order: data.order },
          replace: true 
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  };

  // HELPER POUR WHATSAPP
  const getWhatsAppLink = () => {
    const phone = "23566268256"; // REMPLACE PAR TON NUMÉRO
    const itemsList = cart.map(i => `${i.product.name} (x${i.quantity})`).join(", ");
    const text = `Bonjour Cheel, je souhaite commander : ${itemsList}. Total : ${cartTotal} FCFA`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  if (!cart.length) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 text-center">
        <div className="space-y-6">
          <ShoppingBagIcon className="h-20 w-20 mx-auto text-gray-200" />
          <h2 className="text-2xl font-[1000] uppercase tracking-tighter">Panier vide</h2>
          <Link to="/shop" className="inline-block bg-black text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">
            Découvrir la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-6 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
                <span className="text-indigo-600 text-[9px] font-[1000] uppercase tracking-[0.3em] mb-1 block">Votre Sélection</span>
                <h1 className="text-2xl md:text-6xl font-[1000] uppercase tracking-tighter leading-none italic">
                  Panier <span className="text-gray-200">({totalItems})</span>
                </h1>
            </div>
            <button onClick={clearCart} className="text-[8px] font-black uppercase tracking-widest text-gray-300 hover:text-rose-500 transition-colors flex items-center gap-1.5">
                <TrashIcon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Vider</span>
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-16 items-start">
          
          <div className="lg:col-span-7 space-y-3">
            {cart.map((item) => {
              const product = item.product;
              if (!product) return null;
              const currentPrice = item.unitPrice || product.finalPrice || product.price || 0;
              const oldPrice = item.originalPrice || product.price || 0;
              const hasPromo = oldPrice > currentPrice;

              return (
                <div key={product._id} className="bg-white p-3 md:p-6 rounded-[1.5rem] border border-gray-100 flex items-center gap-3 md:gap-8 transition-all">
                  <div className="relative shrink-0">
                    <img src={getMainImage(product)} alt={product.name} className="w-20 h-24 md:w-32 md:h-40 object-cover rounded-xl bg-gray-50" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-black uppercase text-[10px] md:text-sm tracking-tight mb-0.5 truncate">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className={`text-sm md:text-lg font-[1000] ${hasPromo ? "text-rose-600" : "text-black"}`}>
                          {currentPrice.toLocaleString()} <small className="text-[9px]">FCFA</small>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                            <button onClick={() => updateQuantity(product._id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md transition-all"><MinusIcon className="h-3 w-3" /></button>
                            <span className="px-3 font-black text-[11px]">{item.quantity}</span>
                            <button onClick={() => updateQuantity(product._id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-md transition-all"><PlusIcon className="h-3 w-3" /></button>
                        </div>
                        <button onClick={() => removeFromCart(product._id)} className="p-1.5 text-gray-200 hover:text-rose-500 transition-colors"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-sm p-6 md:p-12 sticky top-24 border border-gray-100">
              <h2 className="text-lg md:text-2xl font-[1000] uppercase tracking-tighter mb-6 italic">Résumé</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <span>Sous-total</span>
                  <span className="text-black">{((cartTotal || 0) + (totalSavings || 0)).toLocaleString()} FCFA</span>
                </div>
                <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-end">
                    <span className="font-black uppercase text-[9px] text-gray-400 tracking-widest mb-1">Total à payer</span>
                    <span className="text-3xl md:text-5xl font-[1000] tracking-tighter text-indigo-600">
                      {cartTotal?.toLocaleString()} <span className="text-[10px] text-black">CFA</span>
                    </span>
                </div>
              </div>

              {!showQuickOrder ? (
                <div className="space-y-3">
                  <button
                    onClick={() => isAuthenticated ? navigate("/checkout") : setShowQuickOrder(true)}
                    className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                  >
                    Commander maintenant <ChevronRightIcon className="h-3.5 w-3.5" />
                  </button>
                  <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" className="w-full border-2 border-green-500/20 text-green-600 py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-green-50 transition-all">
                    Commander via WhatsApp
                  </a>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                      <input required name="fullName" placeholder="VOTRE NOM" onChange={handleInputChange} className="w-full pl-11 pr-4 py-4 bg-gray-50 rounded-xl font-bold text-[10px] uppercase tracking-widest border-transparent focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                          <input required name="phone" placeholder="MOBILE" onChange={handleInputChange} className="w-full pl-11 pr-4 py-4 bg-gray-50 rounded-xl font-bold text-[10px] uppercase tracking-widest border-transparent focus:ring-1 focus:ring-indigo-500" />
                        </div>
                        <div className="relative">
                          <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                          <input required name="neighborhood" placeholder="QUARTIER" onChange={handleInputChange} className="w-full pl-11 pr-4 py-4 bg-gray-50 rounded-xl font-bold text-[10px] uppercase tracking-widest border-transparent focus:ring-1 focus:ring-indigo-500" />
                        </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <button
                      disabled={loading}
                      onClick={submitQuickOrder}
                      className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          TRAITEMENT...
                        </>
                      ) : "CONFIRMER L'ACHAT"}
                    </button>

                    <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" className="w-full bg-green-500/10 text-green-600 py-4 rounded-[1.5rem] font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-green-500/20 transition-all">
                       Préférer WhatsApp
                    </a>

                    <button onClick={() => setShowQuickOrder(false)} className="w-full text-[8px] font-black uppercase text-gray-400 tracking-widest py-1">
                      Retour au panier
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRightIcon = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

export default Cart;