import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { productService } from "../services/productService";
import { 
  ChevronLeftIcon, ChevronRightIcon, BoltIcon, 
  ShieldCheckIcon, TruckIcon, ArrowLeftIcon, 
  MinusIcon, PlusIcon, ShoppingCartIcon, ClockIcon 
} from "@heroicons/react/24/outline";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  // ===============================
  // 1. LOGIQUE DE CHARGEMENT (CORRIGÉE)
  // ===============================
  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productService.getProductById(id);
      const data = res.product || res.data || res;
      setProduct(data);

      if (data.category) {
        const categoryId = data.category._id || data.category;
        const similar = await productService.getProducts({ category: categoryId, limit: 5 });
        setSimilarProducts((similar.products || []).filter(p => p._id !== id));
      }
    } catch (e) {
      console.error("Erreur chargement produit:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loadProduct]);

  // ===============================
  // 2. COMPTE À REBOURS PROMO
  // ===============================
  useEffect(() => {
    if (!product?.promotion?.endDate || !product?.promotion?.isActive) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(product.promotion.endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Offre terminée");
        clearInterval(timer);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${d}j ${h}h ${m}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [product]);

  // ===============================
  // 3. UTILITAIRES
  // ===============================
  const resolveImage = (img) => {
    const url = img?.url || img;
    if (!url) return "https://placehold.co/600x800?text=Produit";
    return url.startsWith("http") ? url : `${API_URL}${url}`;
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin" />
      <p className="mt-4 font-black uppercase tracking-[0.3em] text-[10px] text-gray-400">Chargement...</p>
    </div>
  );

  if (!product) return <div className="text-center py-20 font-black uppercase text-xs">Produit introuvable</div>;

  const images = product.images?.length ? product.images : [{ url: product.image }];
  const isPromoActive = product.promotion?.isActive && product.finalPrice < product.price;
  const outOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="bg-[#FCFCFC] min-h-screen pb-20 font-sans">
      {/* HEADER MOBILE */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b md:hidden">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeftIcon className="h-5 w-5 text-gray-900" />
          </button>
          <span className="font-black uppercase text-[9px] tracking-[0.2em] text-gray-400 truncate max-w-[200px]">
            {product.name}
          </span>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-20">
          
          {/* COLONNE GAUCHE : GALERIE */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden bg-white shadow-sm border border-gray-100">
              <img
                src={resolveImage(images[currentImageIndex])}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-[2s] hover:scale-110 ${outOfStock ? "grayscale opacity-50" : ""}`}
              />

              {images.length > 1 && (
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)} className="p-4 bg-white/80 backdrop-blur-md rounded-full shadow-2xl pointer-events-auto active:scale-75 transition-all">
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)} className="p-4 bg-white/80 backdrop-blur-md rounded-full shadow-2xl pointer-events-auto active:scale-75 transition-all">
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              )}

              {isPromoActive && !outOfStock && (
                <div className="absolute top-6 left-6 bg-rose-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-200">
                  <BoltIcon className="h-4 w-4" /> Offre Spéciale
                </div>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`relative flex-shrink-0 w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${i === currentImageIndex ? "border-indigo-600 scale-105 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"}`}
                >
                  <img src={resolveImage(img)} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* COLONNE DROITE : INFOS & ACTIONS */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-lg">
                  {product.category?.name || "Premium"}
                </span>
                {isLowStock && (
                   <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest animate-pulse">
                     Plus que {product.stock} articles !
                   </span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-[1000] uppercase tracking-tighter leading-tight text-gray-900">
                {product.name}
              </h1>
            </div>

            {/* BOX PRIX & COMPTEUR PROMO */}
            <div className="mb-8 p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className={`text-3xl md:text-4xl font-[1000] tracking-tighter ${isPromoActive ? "text-rose-600" : "text-gray-900"}`}>
                  {(isPromoActive ? product.finalPrice : product.price)?.toLocaleString()} 
                  <span className="text-xs font-black italic ml-1">FCFA</span>
                </span>
                {isPromoActive && (
                  <span className="text-sm line-through text-gray-300 font-bold">
                    {product.price?.toLocaleString()}
                  </span>
                )}
              </div>

              {isPromoActive && timeLeft && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
                  <div className="bg-rose-50 text-rose-600 p-2 rounded-xl">
                    <ClockIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Fin de l'offre dans</p>
                    <p className="text-xs font-black text-rose-600 uppercase">{timeLeft}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="space-y-4 mb-8">
              {!outOfStock && (
                <div className="flex items-center justify-between bg-gray-50 rounded-[2rem] p-2 border border-gray-100">
                  <div className="flex items-center">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                      className="p-4 hover:bg-white hover:shadow-sm rounded-[1.5rem] transition-all active:scale-75"
                    >
                      <MinusIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="w-12 text-center font-[1000] text-gray-900">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} 
                      className="p-4 hover:bg-white hover:shadow-sm rounded-[1.5rem] transition-all active:scale-75"
                    >
                      <PlusIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <p className="pr-6 text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">
                    {product.stock} en stock
                  </p>
                </div>
              )}
              
              <button
                disabled={outOfStock}
                onClick={() => addToCart(product, quantity)}
                className={`group w-full py-6 rounded-[2rem] font-[1000] uppercase tracking-[0.2em] text-[11px] transition-all duration-500 flex items-center justify-center gap-4 ${
                  outOfStock 
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none" 
                    : "bg-gray-900 text-white hover:bg-indigo-600 active:scale-95 shadow-2xl shadow-indigo-100"
                }`}
              >
                {outOfStock ? (
                  "Épuisé"
                ) : (
                  <>
                    <ShoppingCartIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" /> 
                    Ajouter au Panier
                  </>
                )}
              </button>
            </div>

            {/* DESCRIPTION */}
            <div className="border-t border-gray-100 pt-8 pb-10">
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-4">
                <span className="w-12 h-[2px] bg-indigo-600" /> Description
              </h3>
              <div 
                className="prose prose-sm max-w-none text-gray-500 leading-relaxed font-medium text-[13px] md:text-[15px]"
                dangerouslySetInnerHTML={{ __html: product.description }} 
              />
            </div>

            {/* RÉASSURANCE */}
            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-dashed border-gray-200">
              <div className="bg-white p-4 rounded-2xl border border-gray-50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-green-600">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">100% Authentique</span>
                </div>
                <p className="text-[8px] text-gray-400 font-bold uppercase leading-tight">Certifié par nos experts</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-50 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-indigo-600">
                  <TruckIcon className="h-4 w-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Livraison Rapide</span>
                </div>
                <p className="text-[8px] text-gray-400 font-bold uppercase leading-tight">Chez vous sous 48H</p>
              </div>
            </div>
          </div>
        </div>

        {/* SIMILAIRES */}
        {similarProducts.length > 0 && (
          <div className="mt-40">
            <h2 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter leading-none mb-12">
              Vous aimerez <br /><span className="text-indigo-600 italic">aussi.</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {similarProducts.map(p => (
                <Link key={p._id} to={`/product/${p._id}`} className="group block">
                  <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white mb-4 border border-gray-50 shadow-sm transition-transform duration-500 group-hover:-translate-y-2">
                    <img
                      src={resolveImage(p.images?.find(i => i.isMain) || p.images?.[0])}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                  </div>
                  <h4 className="font-black uppercase text-[10px] tracking-tight truncate text-gray-900 mb-1">{p.name}</h4>
                  <p className="text-xs font-black text-indigo-600">{p.price?.toLocaleString()} FCFA</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;