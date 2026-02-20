import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { productService } from "../services/productService";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingBagIcon,
  BoltIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  TruckIcon,
  NoSymbolIcon
} from "@heroicons/react/24/outline";

const API_URL = "http://localhost:5000";

const resolveImage = (img) => {
  if (!img?.url) return "https://placehold.co/600x800?text=Produit";
  return img.url.startsWith("http") ? img.url : `${API_URL}${img.url}`;
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await productService.getProductById(id);
      const data = res.product || res.data || res;
      setProduct(data);

      if (data.category) {
        const categoryId = data.category._id || data.category;
        const similar = await productService.getProducts({
          category: categoryId,
          limit: 6
        });
        setSimilarProducts(
          (similar.products || []).filter(p => p._id !== id)
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest animate-pulse">
        Chargement CHEEL...
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20">Produit introuvable</div>;
  }

  /* =============================
      LOGIQUE UNIFIÉE
  ============================= */
  const images = product.images?.length ? product.images : [];
  const isPromoActive =
    product.promotion?.isActive === true &&
    typeof product.finalPrice === "number";

  const outOfStock = product.stock <= 0;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* =============================
            GALERIE
        ============================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
          <div>
            <div className="relative rounded-[3rem] overflow-hidden bg-gray-100">
              <img
                src={resolveImage(images[currentImageIndex])}
                alt={product.name}
                className={`w-full h-[600px] object-cover transition ${
                  outOfStock ? "grayscale opacity-70" : ""
                }`}
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(i =>
                        i === 0 ? images.length - 1 : i - 1
                      )
                    }
                    className="absolute left-6 top-1/2 bg-white p-4 rounded-full shadow"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>

                  <button
                    onClick={() =>
                      setCurrentImageIndex(i =>
                        i === images.length - 1 ? 0 : i + 1
                      )
                    }
                    className="absolute right-6 top-1/2 bg-white p-4 rounded-full shadow"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}

              {isPromoActive && !outOfStock && (
                <div className="absolute top-6 left-6 bg-rose-600 text-white px-6 py-2 rounded-full text-xs font-black flex items-center gap-2">
                  <BoltIcon className="h-4 w-4" />
                  Offre spéciale
                </div>
              )}
            </div>

            {/* MINIATURES */}
            <div className="flex gap-4 mt-6 justify-center">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border ${
                    i === currentImageIndex
                      ? "border-blue-600"
                      : "border-transparent opacity-40"
                  }`}
                >
                  <img
                    src={resolveImage(img)}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </button>
              ))}
            </div>
          </div>

          {/* =============================
              INFOS
          ============================= */}
          <div>
            <span className="uppercase text-xs font-black text-blue-600">
              {product.category?.name}
            </span>

            <h1 className="text-3xl md:text-4xl font-black uppercase mt-2 mb-4 tracking-tight">
              {product.name}
            </h1>

            {/* --- PRIX --- */}
            <div className="flex items-center gap-4 mb-6">
              <span className={`text-3xl font-black ${isPromoActive ? "text-rose-600" : "text-slate-900"}`}>
                {(isPromoActive ? product.finalPrice : product.price)?.toLocaleString()} FCFA
              </span>
              
              {isPromoActive && (
                <span className="text-lg line-through text-gray-400 font-medium">
                  {product.price?.toLocaleString()}
                </span>
              )}
            </div>

            <div 
              className="text-gray-600 mb-10 leading-relaxed product-description"
              dangerouslySetInnerHTML={{ __html: product.description }} 
            />
            <div className="flex gap-4">
              <button
                disabled={outOfStock}
                onClick={() => addToCart(product, quantity)}
                className={`px-10 py-6 rounded-2xl font-black uppercase ${
                  outOfStock
                    ? "bg-gray-200 text-gray-400"
                    : "bg-black text-white hover:bg-blue-600"
                }`}
              >
                {outOfStock ? "Indisponible" : "Ajouter au panier"}
              </button>
            </div>
          </div>
        </div>

        {/* =============================
            MINI SHOP
        ============================= */}
        {similarProducts.length > 0 && (
          <div className="pt-24 border-t">
            <h2 className="text-5xl font-black uppercase mb-12">
              Produits similaires
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {similarProducts.map(p => (
                <Link key={p._id} to={`/product/${p._id}`}>
                  <img
                    src={resolveImage(
                      p.images?.find(i => i.isMain) || p.images?.[0]
                    )}
                    alt={p.name}
                    className="rounded-2xl mb-4"
                  />
                  <p className="font-black">{p.name}</p>
                  <p className="text-sm">{p.price?.toLocaleString()} FCFA</p>
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
