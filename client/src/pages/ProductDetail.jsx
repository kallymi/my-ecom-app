import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { productService } from "../services/productService";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import ProductGallery from "../components/Product/ProductGallery";
import ProductInfo from "../components/Product/ProductInfo";
import MiniStore from "../components/Product/MiniStore";

const API_URL = process.env.REACT_APP_API_URL || "http://192.168.100.6:5000";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Récupère la fonction du context

  const [product, setProduct] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStore, setLoadingStore] = useState(true);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // --- NOUVELLE FONCTION : ACHAT DIRECT ---
  const handleDirectBuy = (prod, qty) => {
    // 1. On ajoute au panier
    addToCart(prod, qty);
    // 2. On redirige immédiatement vers la page de commande
    navigate("/checkout"); 
  };

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productService.getProductById(id);
      const currentProduct = res.product || res.data || res;

      setProduct(currentProduct);
      
      // Recommandations
      setLoadingStore(true);
      const storeRes = await productService.getAllProducts();
      const allList = storeRes?.products || storeRes?.data || (Array.isArray(storeRes) ? storeRes : []);

      const categoryId = typeof currentProduct.category === "object" 
        ? currentProduct.category?._id 
        : currentProduct.category;

      const filtered = allList
        .filter((p) => p._id !== id)
        .filter((p) => {
          const pCatId = typeof p.category === "object" ? p.category?._id : p.category;
          return pCatId === categoryId;
        })
        .slice(0, 4);

      setStoreProducts(filtered.length > 0 ? filtered : allList.filter((p) => p._id !== id).slice(0, 4));
    } catch (e) {
      console.error("Erreur chargement produit:", e);
    } finally {
      setLoading(false);
      setLoadingStore(false);
    }
  }, [id]);

  useEffect(() => {
    loadAllData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loadAllData]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="text-center py-20 text-sm font-semibold uppercase text-gray-400">
      Produit introuvable
    </div>
  );

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-16">
      {/* HEADER MOBILE */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b md:hidden px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full active:scale-90 transition">
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <span className="text-xs font-semibold tracking-wide text-gray-800">Boutique</span>
        <div className="w-8" />
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
          
          {/* SECTION GAUCHE : GALERIE */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 h-fit">
            <ProductGallery
              images={product.images?.length ? product.images : [{ url: product.image }]}
              name={product.name}
              outOfStock={product.stock <= 0}
              currentIndex={currentImageIndex}
              setCurrentIndex={setCurrentImageIndex}
              resolveImage={(img) => {
                const url = img?.url || img;
                return url ? (url.startsWith("http") ? url : `${API_URL}${url}`) : "https://placehold.co/600x800";
              }}
            />
          </div>

          {/* SECTION DROITE : INFOS & ACTIONS */}
          <div className="lg:col-span-5">
            <ProductInfo
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              onAddToCart={addToCart}      // Pour le bouton "Au Panier"
              onDirectBuy={handleDirectBuy}  // Pour le bouton "Acheter Direct"
              isPromoActive={product.promotion?.isActive}
            />
          </div>
        </div>

        {/* RECOMMANDATIONS */}
        <div className="mt-12 md:mt-20">
          <MiniStore
            products={storeProducts}
            API_URL={API_URL}
            navigate={navigate}
            loading={loadingStore}
          />
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;