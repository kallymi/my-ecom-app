import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Edit3, Trash2, Box, 
  Clock, ShieldCheck
} from "lucide-react";
import api from "../../api/axios";

const API_URL = "http://localhost:5000";
const FALLBACK_IMG = "https://placehold.co/500x500?text=Produit";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  const resolveImageUrl = (img) => {
    if (!img?.url) return FALLBACK_IMG;
    return img.url.startsWith("http") ? img.url : `${API_URL}${img.url}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/products/${id}`);
        const data = res.data.product || res.data;
        setProduct(data);
        const imgs = Array.isArray(data.images) ? data.images : [];
        setActiveImage(imgs.find(i => i.isMain) || imgs[0] || null);

        if (data.category) {
          const categoryId = data.category._id || data.category;
          const similarRes = await api.get(`/admin/products?category=${categoryId}&limit=4`);
          setSimilarProducts(similarRes.data.products.filter(p => p._id !== id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      navigate("/admin/products");
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return null;

  const isPromoActive = product.promotion?.isActive === true;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER RESPONSIVE */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <button
              onClick={() => navigate("/admin/products")}
              className="flex items-center text-gray-400 hover:text-indigo-600 font-black uppercase text-[10px] tracking-widest transition-colors"
            >
              <ArrowLeft size={14} className="mr-2" />
              Retour inventaire
            </button>
            <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter text-slate-900 uppercase italic leading-none">
              Détails<span className="text-indigo-600">.</span>
            </h1>
          </div>

          <div className="flex gap-2">
            <Link to={`/admin/products/${id}/edit`} className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest text-center hover:bg-slate-800 transition-all shadow-lg">
              Éditer
            </Link>
            <button onClick={handleDelete} className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-100 transition-all">
              Supprimer
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* COLONNE GAUCHE: Media */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-50">
                <img src={resolveImageUrl(activeImage)} className="w-full h-full object-cover" alt={product.name} />
              </div>
            </div>
            
            {product.images?.length > 1 && (
              <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex gap-3 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(img)} className={`min-w-[60px] h-[60px] rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage?.url === img.url ? 'border-indigo-600 shadow-md' : 'border-transparent'}`}>
                    <img src={resolveImageUrl(img)} className="w-full h-full object-cover" alt="mini" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLONNE DROITE: Info */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-slate-100 space-y-6 md:space-y-8">
               
               <div className="space-y-1 text-center md:text-left">
                 <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em]">{product.category?.name || "Catégorie"}</span>
                 <h2 className="text-2xl md:text-5xl font-[1000] uppercase tracking-tighter text-slate-900 break-words leading-tight">{product.name}</h2>
               </div>

               {/* GRILLE PRIX & STOCK RÉDUITE */}
               <div className="grid grid-cols-2 gap-3 md:gap-6">
                  <div className={`p-5 md:p-8 rounded-[1.8rem] md:rounded-[2rem] flex flex-col justify-center ${isPromoActive ? 'bg-rose-50' : 'bg-slate-50'}`}>
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prix de vente</p>
                    <p className="text-lg md:text-3xl font-[1000] text-indigo-600 truncate">
                      {(isPromoActive ? product.finalPrice : product.price)?.toLocaleString()} <span className="text-[10px]">FCFA</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 p-5 md:p-8 rounded-[1.8rem] md:rounded-[2rem] flex flex-col justify-center border border-slate-100/50">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock disponible</p>
                    <p className="text-lg md:text-3xl font-[1000] text-slate-900 truncate">
                      {product.stock} <span className="text-[10px] font-bold">unités</span>
                    </p>
                  </div>
               </div>

               {/* LOGISTIQUE COMPACTE */}
               <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="p-4 md:p-6 bg-indigo-50/50 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                      <Clock size={16} className="text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[7px] md:text-[9px] uppercase font-black text-indigo-800 tracking-tighter">Retour</p>
                      <p className="font-black text-[10px] md:text-sm truncate">{product.returnDelay || 7} jours</p>
                    </div>
                  </div>
                  <div className="p-4 md:p-6 bg-emerald-50/50 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                      <ShieldCheck size={16} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[7px] md:text-[9px] uppercase font-black text-emerald-800 tracking-tighter">Garantie</p>
                      <p className="font-black text-[10px] md:text-sm truncate">Authentique</p>
                    </div>
                  </div>
               </div>

               {/* DESCRIPTION AJUSTÉE */}
               <div className="pt-2 md:pt-4">
                 <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Description détaillée</p>
                 <div className="bg-slate-50/80 p-5 md:p-8 rounded-[1.8rem] md:rounded-[2rem] border border-slate-100/50">
                    <div 
                      className="prose prose-sm max-w-none text-slate-600 break-words overflow-hidden text-xs md:text-sm leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: product.description }} 
                    />
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* SIMILAR PRODUCTS */}
        {similarProducts.length > 0 && (
          <div className="mt-16 md:mt-24">
            <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 md:mb-8 ml-2">Articles similaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map(p => (
                <Link key={p._id} to={`/admin/products/${p._id}`} className="group bg-white p-3 md:p-4 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all">
                  <div className="aspect-square rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden mb-3 bg-slate-50">
                    <img src={resolveImageUrl(p.images?.[0])} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                  </div>
                  <p className="font-black text-[11px] md:text-sm px-1 truncate text-slate-900">{p.name}</p>
                  <p className="text-indigo-600 font-bold text-[10px] md:text-xs px-1 mt-0.5">{p.price?.toLocaleString()} FCFA</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}