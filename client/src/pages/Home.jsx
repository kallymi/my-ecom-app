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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(32);

  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Responsive logic
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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          api.get("/products"),
          api.get("/categories"),
        ]);

        if (prodRes.status === "fulfilled") {
          const data = prodRes.value.data;
          setProducts(
            Array.isArray(data)
              ? data
              : data.products || data.data || []
          );
        }

        if (catRes.status === "fulfilled") {
          const data = catRes.value.data;
          setCategories(
            Array.isArray(data)
              ? data
              : data.categories || data.data || []
          );
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrage
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) => (p.category?._id || p.category) === selectedCategory
        );

  // Pagination calcul
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  // Reset page quand filtre change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Scroll top quand page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900">

      {/* HERO */}
      <header className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3 text-indigo-600">
              <Zap size={14} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Nouveautés 2026
              </span>
            </div>

            <h1 className="text-3xl md:text-7xl font-black leading-tight uppercase">
              Le futur <br />
              <span className="text-gray-300 italic">est ici.</span>
            </h1>
          </div>

          <p className="text-gray-400 max-w-xs text-sm">
            Une sélection premium pour une expérience moderne et fluide.
          </p>
        </div>
      </header>

      {/* FILTERS */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-3 overflow-x-auto">
          <FilterBtn
            label="Tous"
            active={selectedCategory === "All"}
            onClick={() => setSelectedCategory("All")}
          />

          {categories.map((cat) => (
            <FilterBtn
              key={cat._id}
              label={cat.name}
              active={selectedCategory === cat._id}
              onClick={() => setSelectedCategory(cat._id)}
            />
          ))}
        </div>
      </nav>

      {/* PRODUCTS */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {currentProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(p - 1, 1))
                  }
                  className="px-4 py-2 bg-gray-100 rounded-xl"
                >
                  ←
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-xl font-bold ${
                      currentPage === i + 1
                        ? "bg-black text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(p + 1, totalPages)
                    )
                  }
                  className="px-4 py-2 bg-gray-100 rounded-xl"
                >
                  →
                </button>
              </div>
            )}

            {/* LOAD MORE MOBILE */}
            {window.innerWidth < 768 &&
              indexOfLastProduct < filteredProducts.length && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() =>
                      setCurrentPage((p) => p + 1)
                    }
                    className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:scale-105 transition"
                  >
                    Voir plus
                  </button>
                </div>
              )}
          </>
        ) : (
          <div className="text-center py-32 text-gray-400">
            Aucun produit disponible
          </div>
        )}
      </main>

      {/* CTA */}
      {/* <footer className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-indigo-600 text-white rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Suivez votre style
          </h2>
          <button className="bg-white text-black px-6 py-3 rounded-xl flex items-center gap-2 mx-auto">
            Mon compte <ArrowRight size={16} />
          </button>
        </div>
      </footer> */}
    </div>
  );
};

const FilterBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-full text-xs font-bold uppercase ${
      active
        ? "bg-black text-white"
        : "bg-gray-100 text-gray-500"
    }`}
  >
    {label}
  </button>
);

export default Home;