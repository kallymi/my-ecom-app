import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Ajout de useNavigate
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import ProductCard from './ProductCard'; // Utilisation du composant ProductCard qu'on a corrigé
import {
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const PRODUCTS_PER_PAGE = 12;

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
  const [page, setPage] = useState(1);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAllProducts();
      const list = res?.products || res?.data || (Array.isArray(res) ? res : []);
      setProducts(list);
      setFilteredProducts(list);

      const uniqueCategories = [...new Set(list.map(p => 
        typeof p.category === 'object' ? p.category?.name : p.category
      ).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...products];
    if (search) result = result.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
    if (category) result = result.filter(p => (typeof p.category === 'object' ? p.category?.name : p.category) === category);

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

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      {/* Container : px-4 sur mobile pour gagner de la place, px-6 sur desktop */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">

        {/* HEADER : Texte plus petit sur mobile */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            Shop <span className="text-gray-300 italic">Global</span>
          </h1>
          <p className="text-gray-400 text-[10px] md:text-sm font-bold uppercase tracking-widest">
            {filteredProducts.length} articles
          </p>
        </div>

        {/* FILTRES : Stackés sur mobile, ligne sur desktop */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="RECHERCHER..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-100 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="flex-1 md:w-48 px-4 py-3 rounded-xl bg-white border border-gray-100 text-[9px] font-black uppercase tracking-widest outline-none"
            >
              <option value="">CATÉGORIES</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="flex-1 md:w-48 px-4 py-3 rounded-xl bg-white border border-gray-100 text-[9px] font-black uppercase tracking-widest outline-none"
            >
              <option value="newest">TRIER PAR</option>
              <option value="price-low">PRIX CROISSANT</option>
              <option value="price-high">PRIX DÉCROISSANT</option>
            </select>
          </div>
        </div>

        {/* GRILLE DE PRODUITS : 2 COLONNES SUR MOBILE (grid-cols-2) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
          {paginatedProducts.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
              API_URL={API_URL} 
              navigate={navigate} 
            />
          ))}
        </div>

        {/* PAGINATION : Boutons plus petits sur mobile */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setPage(i + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl font-black text-xs ${
                  page === i + 1 ? 'bg-black text-white' : 'bg-white text-gray-400 border border-gray-100'
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