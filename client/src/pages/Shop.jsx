import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import {
  MagnifyingGlassIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const API_URL = "http://localhost:5000";
const PRODUCTS_PER_PAGE = 12;

const Shop = () => {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  /* =============================
      FETCH PRODUITS
  ============================= */
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAllProducts();

      const list =
        res?.products ||
        res?.data ||
        (Array.isArray(res) ? res : []);

      setProducts(list);
      setFilteredProducts(list);

      // Catégories uniques
      const uniqueCategories = [
        ...new Set(
          list
            .map(p =>
              typeof p.category === 'object'
                ? p.category?.name
                : p.category
            )
            .filter(Boolean)
        )
      ];

      setCategories(uniqueCategories);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };

  /* =============================
      FILTRES + TRI
  ============================= */
  useEffect(() => {
    let result = [...products];

    if (search) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      result = result.filter(p => {
        const cat =
          typeof p.category === 'object'
            ? p.category?.name
            : p.category;
        return cat === category;
      });
    }

    result.sort((a, b) => {
      const priceA = a.finalPrice ?? a.price ?? 0;
      const priceB = b.finalPrice ?? b.price ?? 0;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredProducts(result);
    setPage(1);
  }, [search, category, sortBy, products]);

  /* =============================
      PAGINATION
  ============================= */
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  /* =============================
      IMAGE RESOLVER (CLOUDINARY + LOCAL)
  ============================= */
  const resolveImage = (product) => {
    const img =
      product.images?.find(i => i.isMain) ||
      product.images?.[0] ||
      product.image;

    if (!img?.url) return "https://placehold.co/400x500?text=Produit";

    return img.url.startsWith('http')
      ? img.url
      : `${API_URL}${img.url}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        <p className="mt-4 text-gray-400 font-black uppercase text-[10px] tracking-widest">
          Chargement de la boutique...
        </p>
      </div>
    );
  }

  /* =============================
      RENDER
  ============================= */
  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tighter">
            Shop <span className="text-gray-300 italic">Global</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            {filteredProducts.length} produits disponibles
          </p>
        </div>

        {/* FILTRES */}
        <div className="bg-white rounded-[2rem] p-4 mb-12 flex flex-wrap gap-4 items-center border border-gray-100">
          <div className="flex-1 relative min-w-[240px]">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 py-4 rounded-xl bg-gray-50 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-6 py-4 rounded-xl bg-gray-50 text-[10px] font-black uppercase tracking-widest"
          >
            <option value="">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-6 py-4 rounded-xl bg-gray-50 text-[10px] font-black uppercase tracking-widest"
          >
            <option value="newest">Nouveautés</option>
            <option value="price-low">Prix croissant</option>
            <option value="price-high">Prix décroissant</option>
          </select>
        </div>

        {/* PRODUITS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {paginatedProducts.map(product => {
            const promoActive = product.promotion?.isActive === true;

            return (
              <div key={product._id} className="group flex flex-col">
                <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-100 mb-6">
                  {promoActive && (
                    <div className="absolute top-5 right-5 bg-rose-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2">
                      <TagIcon className="h-3 w-3" />
                      -{product.promotion.value}
                      {product.promotion.type === 'percentage' ? '%' : ''}
                    </div>
                  )}

                  <img
                    src={resolveImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-end p-6 transition">
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="w-full bg-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white"
                    >
                      Ajouter au panier
                    </button>
                  </div>
                </div>

                <div className="px-2">
                  <span className="text-[9px] font-black uppercase text-gray-400">
                    {typeof product.category === 'object'
                      ? product.category?.name
                      : product.category || 'Standard'}
                  </span>

                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-sm font-black uppercase truncate hover:text-indigo-600">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-2">
                    {promoActive ? (
                      <>
                        <span className="text-xl font-black text-rose-600">
                          {product.finalPrice?.toLocaleString()} FCFA
                        </span>
                        <span className="ml-2 text-xs line-through text-gray-300">
                          {product.price?.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-black">
                        {product.price?.toLocaleString()} FCFA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-20 gap-3">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setPage(i + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-12 h-12 rounded-2xl font-black ${
                  page === i + 1
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-400 border'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
