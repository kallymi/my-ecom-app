import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import ProductCard from './ProductCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Shop = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination moderne
  const [page, setPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(32);

  // Responsive logique
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setProductsPerPage(16);
      } else {
        setProductsPerPage(32);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load data
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAllProducts();

      const list =
        res?.products || res?.data || (Array.isArray(res) ? res : []);

      setProducts(list);
      setFilteredProducts(list);

      const uniqueCategories = [
        ...new Set(
          list
            .map((p) =>
              typeof p.category === "object"
                ? p.category?.name
                : p.category
            )
            .filter(Boolean)
        ),
      ];

      setCategories(uniqueCategories);
    } catch (err) {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  // Filtrage + tri
  useEffect(() => {
    let result = [...products];

    if (search) {
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      result = result.filter(
        (p) =>
          (typeof p.category === "object"
            ? p.category?.name
            : p.category) === category
      );
    }

    result.sort((a, b) => {
      const priceA = a.finalPrice ?? a.price ?? 0;
      const priceB = b.finalPrice ?? b.price ?? 0;

      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredProducts(result);
    setPage(1); // reset page
  }, [search, category, sortBy, products]);

  // Pagination
  const indexOfLast = page * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;

  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Scroll smooth
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-screen">

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tight">
            Shop <span className="text-gray-300 italic">Global</span>
          </h1>
          {/* <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">
            {filteredProducts.length} produits
          </p> */}
        </div>

        {/* FILTRES STICKY */}
        <div className="sticky top-0 z-40 bg-[#fafafa]/80 backdrop-blur pb-4 mb-8">

          <div className="flex flex-col md:flex-row gap-3">

            {/* SEARCH */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* SELECTS */}
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white border text-xs font-bold"
              >
                <option value="">Catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white border text-xs font-bold"
              >
                <option value="newest">Nouveautés</option>
                <option value="price-low">Prix ↑</option>
                <option value="price-high">Prix ↓</option>
              </select>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {currentProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              API_URL={API_URL}
              navigate={navigate}
            />
          ))}
        </div>

        {/* PAGINATION DESKTOP */}
        {window.innerWidth >= 768 && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12 flex-wrap">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-xl font-bold ${
                  page === i + 1
                    ? "bg-black text-white"
                    : "bg-white border"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* LOAD MORE MOBILE */}
        {window.innerWidth < 768 &&
          indexOfLast < filteredProducts.length && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:scale-105 transition"
              >
                Voir plus
              </button>
            </div>
          )}

        {/* EMPTY */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-32 text-gray-400">
            Aucun produit trouvé
          </div>
        )}

      </div>
    </div>
  );
};

export default Shop;