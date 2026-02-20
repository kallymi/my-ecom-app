import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Edit3, Trash2, Box, Info,
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

  /* ============================
      IMAGE RESOLVER (SAFE)
  ============================ */
  const resolveImageUrl = (img) => {
    if (!img?.url) return FALLBACK_IMG;
    return img.url.startsWith("http")
      ? img.url
      : `${API_URL}${img.url}`;
  };

  /* ============================
      FETCH DATA
  ============================ */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/admin/products/${id}`);
        const data = res.data.product || res.data;
        setProduct(data);

        const imgs = Array.isArray(data.images) ? data.images : [];
        setActiveImage(imgs.find(i => i.isMain) || imgs[0] || null);

        if (data.category?._id || data.category) {
          const categoryId = data.category._id || data.category;
          const similarRes = await api.get(`/admin/products?category=${categoryId}&limit=5`);
          setSimilarProducts(
            similarRes.data.products.filter(p => p._id !== id)
          );
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

  /* ============================
      DELETE
  ============================ */
  const handleDelete = async () => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      navigate("/admin/products");
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-black uppercase tracking-widest animate-pulse text-indigo-600">
        Chargement…
      </div>
    );
  }

  if (!product) return null;

  const isPromoActive = product.promotion?.isActive === true;

  /* ============================
      RENDER
  ============================ */
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">

        {/* BACK */}
        <button
          onClick={() => navigate("/admin/products")}
          className="flex items-center text-gray-400 hover:text-indigo-600 mb-10 font-black uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft size={16} className="mr-2" />
          Retour inventaire
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">

          {/* IMAGES */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-[3rem] border aspect-square flex items-center justify-center overflow-hidden">
              {activeImage ? (
                <img
                  src={resolveImageUrl(activeImage)}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Box size={64} className="text-gray-200" />
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`min-w-[80px] h-20 rounded-2xl border-4 overflow-hidden ${
                      activeImage?.url === img.url
                        ? "border-indigo-600"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={resolveImageUrl(img)}
                      className="w-full h-full object-cover"
                      alt="mini"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Link
                to={`/admin/products/${product._id}/edit`}
                className="flex items-center justify-center gap-2 p-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-[10px]"
              >
                <Edit3 size={16} /> Éditer
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 p-5 bg-rose-50 text-rose-600 rounded-[2rem] font-black uppercase text-[10px]"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 border space-y-8">

              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600">
                  {product.category?.name || "Sans catégorie"}
                </span>
                <h1 className="text-5xl font-black uppercase">
                  {product.name}
                </h1>
              </div>

              {/* PRICE */}
              <div className={`p-8 rounded-[2.5rem] ${
                isPromoActive ? "bg-rose-50" : "bg-gray-50"
              }`}>
                <p className="text-[10px] uppercase font-black text-gray-400">
                  Prix
                </p>
                <p className="text-5xl font-black">
                  {(isPromoActive ? product.finalPrice : product.price)?.toLocaleString()} FCFA
                </p>
              </div>

              {/* LOGISTICS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-indigo-50 rounded-[2rem] flex gap-4">
                  <Clock />
                  <div>
                    <p className="text-[9px] uppercase font-black">Retour</p>
                    <p className="font-black">{product.returnDelay || 7} jours</p>
                  </div>
                </div>
                <div className="p-6 bg-emerald-50 rounded-[2rem] flex gap-4">
                  <ShieldCheck />
                  <div>
                    <p className="text-[9px] uppercase font-black">Garantie</p>
                    <p className="font-black">Authentique</p>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <p className="uppercase text-[10px] font-black text-gray-400 mb-2">
                  Description
                </p>
                <div
                  className="p-10 bg-gray-50 rounded-[3rem] prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description || "" }}
                />
              </div>

            </div>
          </div>
        </div>

        {/* SIMILAR */}
        {similarProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-black uppercase mb-10">
              Même catégorie
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {similarProducts.map(p => (
                <Link key={p._id} to={`/admin/products/${p._id}`}>
                  <div className="bg-white p-5 rounded-[3rem] border hover:shadow-xl transition">
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                      <img
                        src={resolveImageUrl(p.images?.[0])}
                        className="w-full h-full object-cover"
                        alt={p.name}
                      />
                    </div>
                    <p className="font-black truncate">{p.name}</p>
                    <p className="text-sm font-bold">
                      {p.price?.toLocaleString()} FCFA
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
