import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { productService } from "../services/productService";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

import ProductGallery from "../components/Product/ProductGallery";
import ProductInfo from "../components/Product/ProductInfo";
import MiniStore from "../components/Product/MiniStore";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStore, setLoadingStore] = useState(true); // Nouveau state pour le chargement de la boutique
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [timeLeft, setTimeLeft] = useState("");

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Charger le produit principal
      const res = await productService.getProductById(id);
      const currentProduct = res.product || res.data || res;
      setProduct(currentProduct);
      setLoading(false); // On libère l'affichage du produit principal dès qu'on l'a

      // 2. Charger les recommandations (Comme dans ton Shop.jsx)
      setLoadingStore(true);
      const storeRes = await productService.getAllProducts(); 
      const allList = storeRes?.products || storeRes?.data || (Array.isArray(storeRes) ? storeRes : []);
      
      // Logique Pro : Produits de la même catégorie, exclure l'actuel, limiter à 4
      const categoryId = typeof currentProduct.category === 'object' ? currentProduct.category?._id : currentProduct.category;
      
      const filtered = allList
        .filter(p => p._id !== id) // Ne pas montrer le produit qu'on regarde déjà
        .filter(p => {
          const pCatId = typeof p.category === 'object' ? p.category?._id : p.category;
          return pCatId === categoryId;
        })
        .slice(0, 4);

      // Si la catégorie est vide, on prend les 4 derniers produits
      setStoreProducts(filtered.length > 0 ? filtered : allList.filter(p => p._id !== id).slice(0, 4));
      
    } catch (e) {
      console.error("Erreur de chargement des données:", e);
    } finally {
      setLoading(false);
      setLoadingStore(false);
    }
  }, [id]);

  useEffect(() => {
    loadAllData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loadAllData]);

  // Loader global pour éviter les erreurs de "null" sur le produit principal
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="font-black uppercase text-[10px] tracking-[0.5em] text-gray-400">Loading Universe...</p>
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 uppercase font-black">Produit introuvable</div>;

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Header Mobile - Design Moderne */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b md:hidden p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-transform">
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 italic">Cheel. Store</span>
        <div className="w-9" />
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-20">
          <ProductGallery 
            images={product.images?.length ? product.images : [{url: product.image}]} 
            name={product.name} 
            outOfStock={product.stock <= 0}
            isPromoActive={product.promotion?.isActive}
            currentIndex={currentImageIndex}
            setCurrentIndex={setCurrentImageIndex}
            resolveImage={(img) => {
               const url = img?.url || img;
               return url ? (url.startsWith("http") ? url : `${API_URL}${url}`) : "https://placehold.co/600x800?text=Produit";
            }}
          />

          <ProductInfo 
            product={product}
            quantity={quantity}
            setQuantity={setQuantity}
            onAddToCart={addToCart}
            isPromoActive={product.promotion?.isActive}
            timeLeft={timeLeft}
          />
        </div>

        {/* MiniStore reçoit maintenant toutes les props nécessaires */}
        <MiniStore 
          products={storeProducts} 
          API_URL={API_URL} 
          navigate={navigate}
          loading={loadingStore} 
        />
      </main>
    </div>
  );
};

export default ProductDetail;