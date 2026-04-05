import React, { useState, useEffect } from "react"; // 1. Ajout de useEffect
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
    checkout,
    loading: cartLoading
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

  // --- CORRECTION SCROLL ---
  // Ce hook force la page à remonter tout en haut dès l'affichage du panier
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitQuickOrder = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.neighborhood) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }

    // setLoading(true);
    // const orderData = {
    //   shippingAddress: formData,
    //   paymentMethod: "COD",
    //   isGuest: true,
    //   items: cart.map(item => ({
    //     product: item.product._id,
    //     quantity: item.quantity,
    //     price: item.product.finalPrice || item.product.price
    //   }))
    // };

    const orderData = {
      shippingAddress: formData,
      paymentMethod: "COD",
      // On passe les infos nécessaires à ta nouvelle fonction checkout du context
      isDirectOrder: false // C'est une commande par panier, donc false
    };

    try {
      // On utilise la fonction centralisée du context
      const res = await checkout(orderData);
      
      if (res && (res.success || res._id)) {
        // La navigation doit se faire immédiatement
        // Le panier est déjà vidé par le context.checkout()
        navigate("/order-confirmation", { 
          state: { order: res.order || res },
          replace: true 
        });
      }
    } catch (err) {
      console.error("Erreur commande rapide:", err);
    }
  };

  const getWhatsAppLink = () => {
    const phone = "23566268256"; // REMPLACE PAR TON NUMÉRO
 
    const itemsList = cart.map(i => `${i.product.name} (x${i.quantity})`).join(", ");
    const text = `Bonjour, je souhaite commander : ${itemsList}. Total : ${cartTotal} FCFA`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  if (!cart.length) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 text-center">
        <div className="space-y-6">
          <ShoppingBagIcon className="h-20 w-20 mx-auto text-gray-200" />
          <h2 className="text-2xl font-[1000] uppercase tracking-tighter italic">Votre panier est vide</h2>
          <Link to="/shop" className="inline-block bg-black text-white px-10 py-5 rounded-2xl font-black uppercase text-[clamp(0.7rem,2vw,0.9rem)] tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-6 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* TITRE */}
        <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
                <span className="text-indigo-600 text-[clamp(0.7rem,2vw,0.9rem)] font-[1000] uppercase tracking-[0.3em] mb-1 block">Récapitulatif</span>
                <h1 className="text-2xl md:text-3xl font-[1000] uppercase tracking-tighter leading-none italic">
                  Mon Panier <span className="text-gray-200">({totalItems})</span>
                </h1>
            </div>
            <button onClick={clearCart} className="text-[clamp(0.7rem,2vw,0.9rem)] font-black uppercase tracking-widest text-gray-300 hover:text-rose-500 transition-colors flex items-center gap-2 border-b border-transparent hover:border-rose-500 pb-1">
                <TrashIcon className="h-4 w-4" /> <span className="hidden sm:inline">Vider le panier</span>
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-16 items-start">
          
          {/* LISTE DES PRODUITS */}
          <div className="lg:col-span-7 space-y-4">
            {cart.map((item) => {
              const product = item.product;
              if (!product) return null;
              const currentPrice = item.unitPrice || product.finalPrice || product.price || 0;
              const oldPrice = item.originalPrice || product.price || 0;
              const hasPromo = oldPrice > currentPrice;

              return (
                <div key={product._id} className="bg-white p-4 md:p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4 md:gap-8 hover:shadow-xl hover:shadow-gray-500/5 transition-all group">
                  <div className="relative shrink-0 overflow-hidden rounded-2xl">
                    <img src={getMainImage(product)} alt={product.name} className="w-24 h-28 md:w-32 md:h-40 object-cover bg-gray-50 group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black uppercase text-[clamp(0.7rem,2vw,0.9rem)] md:text-sm tracking-tight truncate pr-4">{product.name}</h3>
                        <button onClick={() => removeFromCart(product._id)} className="text-gray-200 hover:text-rose-500 transition-colors"><TrashIcon className="h-4 w-4" /></button>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <span className={`text-base md:text-xl font-[1000] ${hasPromo ? "text-rose-600" : "text-black"}`}>
                          {currentPrice.toLocaleString()} <small className="text-[clamp(0.7rem,2vw,0.9rem)] opacity-50">CFA</small>
                        </span>
                        {hasPromo && (
                            <span className="text-[clamp(0.7rem,2vw,0.9rem)] line-through text-gray-300 font-bold italic">
                                {oldPrice.toLocaleString()} CFA
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                            <button onClick={() => updateQuantity(product._id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-rose-500 transition-all"><MinusIcon className="h-3 w-3" /></button>
                            <span className="px-4 font-black text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(product._id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-indigo-600 transition-all"><PlusIcon className="h-3 w-3" /></button>
                        </div>
                        <span className="text-[clamp(0.7rem,2vw,0.9rem)] font-black text-gray-300 uppercase tracking-widest hidden md:block">Article en stock</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RÉSUMÉ ET FORMULAIRE */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm p-8 md:p-12 sticky top-24 border border-gray-100">
              <h2 className="text-xl md:text-3xl font-[1000] uppercase tracking-tighter mb-8 italic">Total Commande</h2>

              <div className="space-y-5 mb-8">
                <div className="flex justify-between text-[clamp(0.7rem,2vw,0.9rem)] font-black text-gray-400 uppercase tracking-widest">
                  <span>Articles ({totalItems})</span>
                  <span className="text-black">{((cartTotal || 0) + (totalSavings || 0)).toLocaleString()} FCFA</span>
                </div>
                
                {totalSavings > 0 && (
                  <div className="flex justify-between text-[clamp(0.7rem,2vw,0.9rem)] font-black text-emerald-500 uppercase tracking-widest">
                    <span>Économies</span>
                    <span>-{totalSavings.toLocaleString()} FCFA</span>
                  </div>
                )}

                <div className="pt-6 border-t border-dashed border-gray-200 flex justify-between items-end">
                    <span className="font-black uppercase text-[clamp(0.7rem,2vw,0.9rem)] text-black tracking-widest mb-1">À payer</span>
                    <span className="text-3xl md:text-5xl font-[1000] tracking-tighter text-indigo-600">
                      {cartTotal?.toLocaleString()} <span className="text-[clamp(0.7rem,2vw,0.9rem)] text-black">FCFA</span>
                    </span>
                </div>
              </div>

              {!showQuickOrder ? (
                <div className="space-y-3">
                  <button
                    onClick={() => isAuthenticated ? navigate("/checkout") : setShowQuickOrder(true)}
                    className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase text-[clamp(0.7rem,2vw,0.9rem)] tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    Valider la commande <ChevronRightIcon className="h-4 w-4" />
                  </button>
                  <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" className="w-full border-2 border-green-500/10 text-green-600 py-6 rounded-2xl font-black uppercase text-[clamp(0.7rem,2vw,0.9rem)] tracking-widest flex items-center justify-center gap-2 hover:bg-green-50 transition-all">
                    Acheter via WhatsApp
                  </a>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <p className="text-[clamp(0.7rem,2vw,0.9rem)] font-black text-gray-400 uppercase text-center mb-4 tracking-widest">Infos de livraison rapide</p>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                      <input required name="fullName" placeholder="NOM COMPLET" onChange={handleInputChange} className="w-full pl-11 pr-4 py-5 bg-gray-50 rounded-2xl font-bold text-[clamp(0.7rem,2vw,0.9rem)] uppercase tracking-widest border-transparent focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="relative">
                          <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                          <input required name="phone" placeholder="TÉLÉPHONE" onChange={handleInputChange} className="w-full pl-11 pr-4 py-5 bg-gray-50 rounded-2xl font-bold text-[clamp(0.7rem,2vw,0.9rem)] uppercase tracking-widest border-transparent focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                        <div className="relative">
                          <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                          <input required name="neighborhood" placeholder="QUARTIER" onChange={handleInputChange} className="w-full pl-11 pr-4 py-5 bg-gray-50 rounded-2xl font-bold text-[clamp(0.7rem,2vw,0.9rem)] uppercase tracking-widest border-transparent focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                        <div className="relative">
                          <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                          <input required name="neighborhood" placeholder="DETAILS" onChange={handleInputChange} className="w-full pl-11 pr-4 py-5 bg-gray-50 rounded-2xl font-bold text-[clamp(0.7rem,2vw,0.9rem)] uppercase tracking-widest border-transparent focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <button
                      disabled={cartLoading}
                      onClick={submitQuickOrder}
                      className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase text-[clamp(0.7rem,2vw,0.9rem)] tracking-widest shadow-xl shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      {cartLoading ? "TRAITEMENT EN COURS..." : "CONFIRMER L'ACHAT"}
                    </button>

                    <button onClick={() => setShowQuickOrder(false)} className="w-full text-[clamp(0.7rem,2vw,0.9rem)] font-black uppercase text-gray-300 hover:text-black tracking-[0.2em] py-2 transition-all">
                       Annuler et revenir au panier
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

// Composant icône interne pour éviter l'erreur d'import
const ChevronRightIcon = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

export default Cart;