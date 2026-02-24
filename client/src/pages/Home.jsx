import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Loader2, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On utilise l'URL du .env pour que ça marche sur mobile
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          api.get("/products"),
          api.get("/categories")
        ]);

        if (prodRes.status === "fulfilled") {
          const data = prodRes.value.data;
          setProducts(Array.isArray(data) ? data : (data.products || data.data || []));
        }
        if (catRes.status === "fulfilled") {
          const data = catRes.value.data;
          setCategories(Array.isArray(data) ? data : (data.categories || data.data || []));
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => (p.category?._id || p.category) === selectedCategory);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 overflow-x-hidden">
      
      {/* HEADER / HERO - Adapté Mobile */}
      <header className="pt-16 md:pt-24 pb-8 md:pb-12 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3 text-indigo-600">
              <Zap size={14} fill="currentColor" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">Nouveautés 2026</span>
            </div>
            {/* Taille de texte responsive : text-5xl sur mobile, text-8xl sur PC */}
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              Le futur <br /><span className="text-gray-200 italic leading-none">est ici.</span>
            </h1>
          </div>
          <p className="text-gray-400 max-w-[250px] md:max-w-xs text-xs md:text-sm font-medium leading-relaxed">
            Une sélection rigoureuse pour ceux qui cherchent l'exceptionnel au quotidien.
          </p>
        </div>
      </header>

      {/* FILTRES NAVIGATION - Sticky & Scrollable */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 mb-8 md:mb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
          <FilterBtn 
            label="Tous" 
            active={selectedCategory === "All"} 
            onClick={() => setSelectedCategory("All")} 
          />
          {categories.map(cat => (
            <FilterBtn 
              key={cat._id}
              label={cat.name} 
              active={selectedCategory === cat._id} 
              onClick={() => setSelectedCategory(cat._id)} 
            />
          ))}
        </div>
      </nav>

      {/* GRILLE DE PRODUITS - 2 Colonnes Mobile */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-12 md:pb-20">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-8 md:gap-y-12">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                API_URL={API_URL} 
                navigate={navigate} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 md:py-40 border-2 border-dashed border-gray-100 rounded-[2rem] md:rounded-[3rem]">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 px-4">
              Collection en cours de réapprovisionnement
            </p>
          </div>
        )}
      </main>

      {/* FOOTER CTA - Adapté Mobile */}
      <footer className="max-w-7xl mx-auto px-4 md:px-6 pb-12 md:pb-20">
        <div className="bg-indigo-600 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-6">Suivez votre style.</h2>
          <button className="bg-white text-black px-6 py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase flex items-center gap-3 mx-auto hover:scale-105 transition-transform active:scale-95">
            Mon compte <ArrowRight size={14} />
          </button>
        </div>
      </footer>
    </div>
  );
};

const FilterBtn = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-90 ${
      active ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

export default Home;