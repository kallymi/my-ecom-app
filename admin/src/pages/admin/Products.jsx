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

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data.categories || data);
    } catch (err) {
      console.error("Erreur chargement catégories:", err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/products?keyword=${keyword}&category=${selectedCategory}&page=${page}&limit=10`
      );

      const productsData = data.products || [];
      setProducts(productsData);
      setPages(data.pagination?.pages || 1);

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

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [keyword, page, selectedCategory]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">

      {/* ---------------- STATS DASHBOARD ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center">
            <Box size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Produits</p>
            <p className="text-xl md:text-2xl font-black text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-50 text-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center">
            <TrendingDown size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Faible</p>
            <p className="text-xl md:text-2xl font-black text-amber-600">{stats.lowStock}</p>
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 md:w-14 md:h-14 bg-rose-50 text-rose-600 rounded-xl md:rounded-2xl flex items-center justify-center">
            <AlertCircle size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Rupture</p>
            <p className="text-xl md:text-2xl font-black text-rose-600">{stats.outOfStock}</p>
          </div>
        </div>
      </div>

      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight uppercase italic">
            Inventaire <span className="text-indigo-600">Pro</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium">Gestion du catalogue en temps réel.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-indigo-600 text-white px-6 py-4 md:px-10 md:py-5 rounded-2xl md:rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95"
        >
          <Plus size={16} /> Ajouter
        </Link>
      </div>

      {/* ---------------- FILTRES ---------------- */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center bg-white p-3 md:p-4 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-50">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={keyword}
            onChange={(e) => { setPage(1); setKeyword(e.target.value); }}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <select
            value={selectedCategory}
            onChange={(e) => { setPage(1); setSelectedCategory(e.target.value); }}
            className="w-full pl-12 pr-8 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-sm text-gray-600 cursor-pointer"
          >
            <option value="">Catégories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ---------------- GRILLE PRODUITS ---------------- */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[200px] md:h-[400px] bg-white rounded-2xl md:rounded-[3rem] animate-pulse shadow-sm border border-gray-100"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] md:rounded-[4rem] border-2 border-dashed border-gray-100">
          <Box size={40} className="mx-auto text-gray-200 mb-2" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Aucun produit</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {products.map((product) => {
            const mainImage = product.images?.find(img => img.isMain)?.url || product.images?.[0]?.url || product.image?.url || "/placeholder.png";

            return (
              <div
                key={product._id}
                className="group relative bg-white rounded-2xl md:rounded-[3rem] shadow-sm hover:shadow-xl transition-all duration-500 p-3 md:p-6 flex flex-col border border-gray-100 overflow-hidden"
              >
                {/* STATUS BADGE */}
                <div className={`absolute top-2 left-2 md:top-6 md:left-6 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[6px] md:text-[8px] font-black uppercase tracking-widest z-10 ${product.isActive !== false ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                  {product.isActive !== false ? '● En Ligne' : '○ Off'}
                </div>

                {/* IMAGE */}
                <div className="relative aspect-square rounded-xl md:rounded-[2.5rem] overflow-hidden mb-3 md:mb-6 bg-gray-50">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gray-900/40 md:bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 md:gap-4 backdrop-blur-[2px]">
                    <button onClick={() => navigate(`/admin/products/${product._id}`)} className="p-2 md:p-4 bg-white rounded-lg md:rounded-2xl text-gray-900 hover:bg-indigo-600 hover:text-white shadow-xl transition-all">
                      <Eye size={16} className="md:w-5 md:h-5" />
                    </button>
                    <button onClick={() => navigate(`/admin/products/${product._id}/edit`)} className="p-2 md:p-4 bg-white rounded-lg md:rounded-2xl text-gray-900 hover:bg-indigo-600 hover:text-white shadow-xl transition-all">
                      <Edit2 size={16} className="md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>

                {/* INFOS */}
                <div className="space-y-1 md:space-y-2 mb-3 md:mb-6">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[7px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest truncate max-w-[60%]">
                      {product.category?.name || "Général"}
                    </span>
                    {product.promotion?.isActive && (
                      <span className="text-[7px] md:text-[10px] font-black text-rose-500 uppercase">
                        -{product.promotion.value}%
                      </span>
                    )}
                  </div>
                  <h2 className="text-xs md:text-xl font-black text-gray-900 truncate uppercase tracking-tighter px-1">
                    {product.name}
                  </h2>
                </div>

                {/* STOCK & PRIX */}
                <div className="mt-auto flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between bg-gray-50 p-2 md:p-4 rounded-xl md:rounded-[2rem]">
                  <span className="text-[10px] md:text-lg font-black text-gray-900 italic">
                    {product.promotion?.isActive && product.finalPrice ? product.finalPrice.toLocaleString() : product.price.toLocaleString()}
                    <small className="text-[6px] md:text-[10px] ml-0.5 md:ml-1 not-italic">FCFA</small>
                  </span>
                  <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[6px] md:text-[8px] font-black uppercase tracking-widest ${
                    product.stock <= 0 ? "bg-rose-500 text-white" : product.stock < 10 ? "bg-amber-500 text-white" : "bg-white text-gray-900 border border-gray-100"
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
        <div className="flex justify-center items-center gap-2 mt-8 md:mt-16 pb-10">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl text-xs md:text-base font-black transition-all ${
                page === i + 1 ? "bg-gray-900 text-white shadow-lg scale-110" : "bg-white text-gray-400 shadow-sm"
              }`}
              onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}