import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Edit2,
  Search,
  Tag,
  AlertCircle,
  Layers,
  Box,
  TrendingDown
} from "lucide-react";
import api from "../../api/axios";

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, lowStock: 0, outOfStock: 0 });

  // ------------------- Charger les catégories -------------------
  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data.categories || data);
    } catch (err) {
      console.error("Erreur chargement catégories:", err);
    }
  };

  // ------------------- Charger les produits -------------------
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/products?keyword=${keyword}&category=${selectedCategory}&page=${page}&limit=9`
      );

      const productsData = data.products || [];
      setProducts(productsData);
      setPages(data.pagination?.pages || 1);

      // Statistiques simples
      const low = productsData.filter(p => p.stock > 0 && p.stock < 10).length;
      const out = productsData.filter(p => p.stock <= 0).length;

      setStats({
        total: data.pagination?.total || productsData.length,
        lowStock: low,
        outOfStock: out
      });

    } catch (error) {
      console.error("Erreur de chargement des produits", error);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- useEffect -------------------
  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [keyword, page, selectedCategory]);

  // ------------------- RENDER -------------------
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* ---------------- STATS DASHBOARD ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Produits */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Box size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Produits</p>
            <p className="text-2xl font-black text-gray-900">{stats.total}</p>
          </div>
        </div>
        {/* Stock Faible */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Faible</p>
            <p className="text-2xl font-black text-amber-600">{stats.lowStock} <span className="text-xs font-medium text-gray-400">réf.</span></p>
          </div>
        </div>
        {/* Rupture Stock */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rupture Stock</p>
            <p className="text-2xl font-black text-rose-600">{stats.outOfStock}</p>
          </div>
        </div>
      </div>

      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">
            Inventaire <span className="text-indigo-600">Pro</span>
          </h1>
          <p className="text-gray-500 font-medium">Flux de produits et monitoring des ventes.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center justify-center gap-3 bg-gray-900 hover:bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all shadow-xl hover:-translate-y-1 active:scale-95"
        >
          <Plus size={18} /> Ajouter un Produit
        </Link>
      </div>

      {/* ---------------- FILTRES & RECHERCHE ---------------- */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-50">
        {/* Recherche */}
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Rechercher une référence..."
            value={keyword}
            onChange={(e) => { setPage(1); setKeyword(e.target.value); }}
            className="w-full pl-16 pr-10 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
          />
        </div>
        {/* Filtre catégorie */}
        <div className="relative w-full md:w-64">
          <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={selectedCategory}
            onChange={(e) => { setPage(1); setSelectedCategory(e.target.value); }}
            className="w-full pl-16 pr-10 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-gray-600 cursor-pointer"
          >
            <option value="">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ---------------- GRILLE PRODUITS ---------------- */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[400px] bg-white rounded-[3rem] animate-pulse shadow-sm border border-gray-100"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-gray-100">
          <Box size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
            Aucun produit dans cette sélection
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const mainImage =
              product.images?.find(img => img.isMain)?.url ||
              product.images?.[0]?.url ||
              product.image?.url ||
              "/placeholder.png";

            return (
              <div
                key={product._id}
                className="group relative bg-white rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 p-6 flex flex-col border border-gray-100"
              >
                {/* STATUS BADGE */}
                <div className={`absolute top-6 left-6 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest z-10 ${product.isActive !== false ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                  {product.isActive !== false ? '● En Ligne' : '○ Brouillon'}
                </div>

                {/* IMAGE */}
                <div className="relative aspect-square rounded-[2.5rem] overflow-hidden mb-6 bg-gray-50 border border-gray-50">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                    <button
                      onClick={() => navigate(`/admin/products/${product._id}`)}
                      className="p-4 bg-white rounded-2xl text-gray-900 hover:bg-indigo-600 hover:text-white transition-all hover:scale-110 shadow-xl"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                      className="p-4 bg-white rounded-2xl text-gray-900 hover:bg-indigo-600 hover:text-white transition-all hover:scale-110 shadow-xl"
                    >
                      <Edit2 size={20} />
                    </button>
                  </div>
                </div>

                {/* INFOS */}
                <div className="space-y-2 mb-6 px-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      {product.category?.name || "Général"}
                    </span>
                    {product.promotion?.isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase">
                        <Tag size={12} /> -{product.promotion.value}{product.promotion.type === 'percentage' ? '%' : ''}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-gray-900 truncate uppercase tracking-tighter">
                    {product.name}
                  </h2>
                </div>

                {/* STOCK & PRIX */}
                <div className="mt-auto flex items-center justify-between bg-gray-50 p-4 rounded-[2rem]">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-gray-900 italic">
                      {product.promotion?.isActive && product.finalPrice
                        ? product.finalPrice.toLocaleString()
                        : product.price.toLocaleString()
                      }
                      <small className="text-[10px] ml-1 not-italic">FCFA</small>
                    </span>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                    product.stock <= 0
                      ? "bg-rose-500 text-white"
                      : product.stock < 10
                        ? "bg-amber-500 text-white"
                        : "bg-white text-gray-900"
                  }`}>
                    {product.stock <= 0 ? "Rupture" : `${product.stock} Dispo`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------- PAGINATION ---------------- */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-16 pb-10">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              className={`w-12 h-12 rounded-2xl font-black transition-all ${
                page === i + 1
                  ? "bg-gray-900 text-white shadow-2xl scale-125 -translate-y-1"
                  : "bg-white text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm"
              }`}
              onClick={() => {
                setPage(i + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
