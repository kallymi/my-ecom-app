import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import ProductCard from './ProductCard';
import { 
  MagnifyingGlassIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Shop = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // États principaux
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtres et Tri
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination Serveur
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(32);

  // 1. Gestion du Responsive (Nombre d'articles par page)
  useEffect(() => {
    const handleResize = () => {
      setLimit(window.innerWidth < 768 ? 16 : 32);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Chargement dynamique des données depuis le Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: "smooth" });

        // On construit les paramètres à envoyer au backend
        const queryParams = {
          page,
          limit,
          sort: sortBy,
          ...(search && { search }),
          ...(category && { category })
        };

        // ASSURE-TOI que ton productService.getAllProducts accepte ces paramètres
        const res = await productService.getAllProducts(queryParams);

        const list = res?.data || [];
        setProducts(list);
        setTotalPages(res?.pagination?.totalPages || 1);

        // Extraction des catégories (idéalement, à faire via une route API dédiée /api/categories à l'avenir)
        if (categories.length === 0 && list.length > 0) {
          const categoryMap = new Map();
          
          list.forEach(p => {
            if (p.category && typeof p.category === "object") {
              // On sauvegarde l'ID comme clé, et le nom comme valeur
              categoryMap.set(p.category._id, p.category.name);
            }
          });

          // On transforme ça en tableau d'objets [{ id: "...", name: "..." }]
          const uniqueCategories = Array.from(categoryMap, ([id, name]) => ({ id, name }));
          setCategories(uniqueCategories);
        }

      } catch (err) {
        console.error("Erreur Fetch:", err);
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    };

    // On relance le fetch à chaque fois qu'un filtre ou la page change
    // Un léger délai (debounce) est appliqué nativement par la réactivité de React ici
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300); // Évite de spammer le backend si l'utilisateur tape vite dans la barre de recherche

    return () => clearTimeout(timeoutId);
  }, [page, limit, search, category, sortBy]);

  // 3. Reset de la page à 1 si l'utilisateur change un filtre
  useEffect(() => {
    setPage(1);
  }, [search, category, sortBy]);

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">

        {/* HEADER */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-gray-900">
            Shop <span className="text-indigo-600 italic">Global</span>
          </h1>
        </div>

        {/* BARRE DE FILTRES STICKY */}
        <div className="sticky top-0 z-40 bg-[#fafafa]/90 backdrop-blur-md pb-4 mb-8 pt-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* RECHERCHE */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit, une marque..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {/* SÉLECTEURS (Catégories & Tri) */}
            <div className="flex gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
              >
                <option value="newest">Nouveautés</option>
                <option value="price-low">Prix croissant</option>
                <option value="price-high">Prix décroissant</option>
              </select>
            </div>
          </div>
        </div>

        {/* GESTION DU CHARGEMENT & ERREURS */}
        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-bold bg-red-50 rounded-2xl">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">Aucun produit ne correspond à votre recherche.</p>
            <button onClick={() => {setSearch(''); setCategory('');}} className="mt-4 text-indigo-600 font-bold hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          /* GRILLE DE PRODUITS */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 transition-opacity duration-300">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                API_URL={API_URL}
                navigate={navigate}
              />
            ))}
          </div>
        )}

        {/* PAGINATION UNIVERSELLE (Design Premium) */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16 pb-10">
            {/* Bouton Précédent */}
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="p-3 rounded-xl border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            {/* Chiffres de pagination */}
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all duration-300 ${
                      page === pageNum
                        ? "bg-[#1e293b] text-white shadow-lg scale-105"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Bouton Suivant */}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="p-3 rounded-xl border border-gray-200 text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Shop;