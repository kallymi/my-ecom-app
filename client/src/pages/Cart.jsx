import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  TagIcon,
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

  const handleCheckout = () => {
    if (isAuthenticated) navigate("/checkout");
    else setShowQuickOrder(true);
  };

  const submitQuickOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
    shippingAddress: formData,
    paymentMethod: "COD",
    isGuest: true,
    // ⚠️ IMPORTANT POUR LE MODE INVITÉ
    items: cart.map(item => ({
      product: item.product._id,
      quantity: item.quantity
    }))
  };

    try {
      const { data } = await api.post("/orders", orderData);

      if (data?.success) {
        alert(`Commande validée • N° ${data.order.orderNumber}`);
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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border">
          <ShoppingBagIcon className="h-20 w-20 mx-auto text-gray-200 mb-6" />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">
            Panier vide
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center bg-black text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-3" /> Explorer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-12 italic">
          Mon Panier
          <span className="ml-6 text-[10px] bg-black text-white px-5 py-2 rounded-full not-italic">
            {totalItems || 0} ARTICLES
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* LISTE PRODUITS */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-[2.5rem] border overflow-hidden">
              <ul className="divide-y">
                {cart.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  // 🛠️ LA CORRECTION EST ICI :
                  // On regarde d'abord item.unitPrice (gelé) puis product.finalPrice
                  const currentPrice = item.unitPrice || product.finalPrice || product.price || 0;
                  const oldPrice = item.originalPrice || product.price || 0;
                  
                  const hasPromo = oldPrice > currentPrice;
                  const discountPercent = hasPromo 
                    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) 
                    : 0;

                  return (
                    <li key={product._id} className="p-8 flex flex-col sm:flex-row items-center gap-8">
                      <div className="relative">
                        <img
                          src={getMainImage(product)}
                          alt={product.name}
                          className="w-32 h-32 object-cover rounded-[2rem] bg-gray-50"
                        />
                        {hasPromo && (
                          <div className="absolute -top-2 -left-2 bg-rose-600 p-2 rounded-xl shadow-lg ring-4 ring-white">
                            <TagIcon className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-black uppercase text-lg tracking-tighter mb-2">
                          {product.name}
                        </h3>

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                          <span className={`text-xl font-black ${hasPromo ? "text-rose-600" : "text-gray-900"}`}>
                            {(currentPrice).toLocaleString()} FCFA
                          </span>

                          {hasPromo && (
                            <>
                              <span className="text-sm font-bold text-gray-300 line-through">
                                {(oldPrice).toLocaleString()} FCFA
                              </span>
                              <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-1 rounded-lg">
                                -{discountPercent}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* QUANTITÉ */}
                      <div className="flex items-center bg-gray-100 rounded-2xl p-1.5">
                        <button
                          onClick={() => updateQuantity(product._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="px-5 font-black text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-xl"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="p-3 text-gray-300 hover:text-rose-500 transition-colors"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* RÉCAPITULATIF */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 sticky top-8 border border-gray-50">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 italic">
                Récapitulatif
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-400 font-bold text-sm uppercase tracking-widest">
                  <span>Sous-total</span>
                  <span className="text-gray-900">
                    {((cartTotal || 0) + (totalSavings || 0)).toLocaleString()} FCFA
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between items-center bg-rose-50 p-4 rounded-2xl">
                    <span className="text-rose-600 font-black text-[10px] uppercase tracking-widest">
                      Économie promo
                    </span>
                    <span className="text-rose-600 font-black">
                      -{(totalSavings || 0).toLocaleString()} FCFA
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-dashed border-gray-200 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-black uppercase text-xs text-gray-400">Total à payer</span>
                  <span className="text-4xl font-black tracking-tighter text-indigo-600">
                    {(cartTotal || 0).toLocaleString()}
                    <span className="text-[15px] ml-1 text-gray-900">FCFA</span>
                  </span>
                </div>
              </div>

              {!showQuickOrder ? (
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
                >
                  Commander
                </button>
              ) : (
                <form onSubmit={submitQuickOrder} className="space-y-3">
                  <input
                    required
                    name="fullName"
                    placeholder="NOM COMPLET"
                    onChange={handleInputChange}
                    className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm border-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      name="phone"
                      placeholder="TÉLÉPHONE"
                      onChange={handleInputChange}
                      className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm border-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      required
                      name="neighborhood"
                      placeholder="QUARTIER"
                      onChange={handleInputChange}
                      className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-sm border-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest disabled:opacity-50"
                  >
                    {loading ? "TRAITEMENT..." : "CONFIRMER LA COMMANDE"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowQuickOrder(false)}
                    className="w-full text-[10px] font-black uppercase text-gray-400 tracking-widest py-2"
                  >
                    Retour
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;