import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  TagIcon,
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

  const submitQuickOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    const orderData = {
      shippingAddress: formData,
      paymentMethod: "COD",
      isGuest: true,
      items: cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }))
    };

    try {
      const { data } = await api.post("/orders", orderData);
      if (data?.success) {
        clearCart();
        navigate("/");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <ShoppingBagIcon className="h-20 w-20 mx-auto text-gray-200" />
          <div>
            <h2 className="text-2xl font-[1000] uppercase tracking-tighter mb-2">Panier vide</h2>
            <p className="text-gray-400 text-sm font-medium tracking-tight">Faites défiler la boutique pour trouver votre bonheur.</p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center bg-black text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
          >
            Découvrir la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-6 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* TITRE SECTION - Plus compact sur mobile */}
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
          
          {/* LISTE PRODUITS */}
          <div className="lg:col-span-7 space-y-3">
            {cart.map((item) => {
              const product = item.product;
              if (!product) return null;

              const currentPrice = item.unitPrice || product.finalPrice || product.price || 0;
              const oldPrice = item.originalPrice || product.price || 0;
              const hasPromo = oldPrice > currentPrice;

              return (
                <div key={product._id} className="bg-white p-3 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 flex items-center gap-3 md:gap-8 transition-all">
                  {/* Image plus petite sur mobile */}
                  <div className="relative shrink-0">
                    <img
                      src={getMainImage(product)}
                      alt={product.name}
                      className="w-20 h-24 md:w-32 md:h-40 object-cover rounded-xl md:rounded-2xl bg-gray-50"
                    />
                  </div>

                  {/* Infos textes réduits */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black uppercase text-[10px] md:text-sm tracking-tight mb-0.5 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3 md:mb-4">
                        <span className={`text-sm md:text-lg font-[1000] ${hasPromo ? "text-rose-600" : "text-black"}`}>
                          {(currentPrice).toLocaleString()} <small className="text-[9px] font-bold">FCFA</small>
                        </span>
                        {hasPromo && (
                            <span className="text-[9px] font-bold text-gray-300 line-through">
                                {(oldPrice).toLocaleString()}
                            </span>
                        )}
                    </div>

                    {/* Contrôles Quantité */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 rounded-lg md:rounded-xl p-0.5 border border-gray-100">
                            <button
                                onClick={() => updateQuantity(product._id, item.quantity - 1)}
                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded-md transition-all"
                            >
                                <MinusIcon className="h-3 w-3" />
                            </button>
                            <span className="px-3 font-black text-[11px] md:text-xs">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(product._id, item.quantity + 1)}
                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded-md transition-all"
                            >
                                <PlusIcon className="h-3 w-3" />
                            </button>
                        </div>
                        <button
                            onClick={() => removeFromCart(product._id)}
                            className="p-1.5 text-gray-200 hover:text-rose-500 transition-colors"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RÉCAPITULATIF */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-sm p-6 md:p-12 sticky top-24 border border-gray-100">
              <h2 className="text-lg md:text-2xl font-[1000] uppercase tracking-tighter mb-6 md:mb-10 italic">Résumé</h2>

              <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <span>Sous-total</span>
                  <span className="text-black">
                    {((cartTotal || 0) + (totalSavings || 0)).toLocaleString()} FCFA
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between items-center bg-rose-50 px-4 py-3 rounded-xl border border-rose-100">
                    <span className="text-rose-600 font-black text-[8px] uppercase tracking-widest">Promotion</span>
                    <span className="text-rose-600 font-black text-xs">
                      -{(totalSavings || 0).toLocaleString()} <small className="text-[9px]">FCFA</small>
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-dashed border-gray-100">
                    <div className="flex justify-between items-end">
                      <span className="font-black uppercase text-[9px] text-gray-400 tracking-widest mb-1">Total à payer</span>
                      <span className="text-3xl md:text-5xl font-[1000] tracking-tighter text-indigo-600">
                        {(cartTotal || 0).toLocaleString()}
                        <span className="text-[10px] ml-1 text-black uppercase">CFA</span>
                      </span>
                    </div>
                </div>
              </div>

              {!showQuickOrder ? (
                <button
                  onClick={() => {
                    if (isAuthenticated) navigate("/checkout");
                    else setShowQuickOrder(true);
                  }}
                  className="w-full bg-black text-white py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Commander maintenant <ChevronRightIcon className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                        <input
                            required
                            name="fullName"
                            placeholder="VOTRE NOM"
                            onChange={handleInputChange}
                            className="w-full pl-11 pr-4 py-4 bg-gray-50 rounded-xl font-bold text-[10px] uppercase tracking-widest border-transparent focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                            <input
                                required
                                name="phone"
                                placeholder="MOBILE"
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 rounded-xl font-bold text-[10px] uppercase tracking-widest border-transparent focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                          </div>
                          <div className="relative">
                            <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                            <input
                                required
                                name="neighborhood"
                                placeholder="QUARTIER"
                                onChange={handleInputChange}
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 rounded-xl font-bold text-[10px] uppercase tracking-widest border-transparent focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                          </div>
                      </div>
                  </div>
                  <button
                    disabled={loading}
                    onClick={submitQuickOrder}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg disabled:opacity-50"
                  >
                    {loading ? "TRAITEMENT..." : "CONFIRMER L'ACHAT"}
                  </button>
                  <button 
                    onClick={() => setShowQuickOrder(false)}
                    className="w-full text-[8px] font-black uppercase text-gray-400 tracking-widest py-1"
                  >
                    Annuler
                  </button>
                </div>
              )}
              
              <div className="mt-6 flex items-center justify-center gap-4 opacity-20 grayscale scale-75">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-3" alt="visa" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-6" alt="mastercard" />
              </div>
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