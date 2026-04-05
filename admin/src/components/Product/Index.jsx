import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import api from "../../api/axios";

// Import des sous-composants
import ImageSection from "./ImageSection";
import BasicInfoSection from "./BasicInfoSection";
import DescriptionSection from "./DescriptionSection";
import PromotionSection from "./PromotionSection";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  // État unifié pour les images
  const [images, setImages] = useState({
    mainFile: null,
    mainPreview: null,
    galleryFiles: [],
    galleryPreviews: []
  });

  const [form, setForm] = useState({
    name: "", price: "", stock: 0, category: "",
    description: "", returnDelay: 7,
    promotion: { isActive: false, type: "percentage", value: 0, startDate: "", endDate: "" }
  });

  useEffect(() => {
    const initData = async () => {
      try {
        const resCats = await api.get("/admin/categories");
        setCategories(resCats.data.categories || resCats.data);

        if (isEdit) {
          const { data } = await api.get(`/admin/products/${id}`);
          const p = data.product || data;
          
          setForm({
            name: p.name || "",
            price: p.price || "",
            stock: p.stock || 0,
            category: p.category?._id || p.category || "",
            description: p.description || "",
            returnDelay: p.returnDelay || 7,
            promotion: {
              isActive: p.promotion?.isActive || false,
              type: p.promotion?.type || "percentage",
              value: p.promotion?.value || 0,
              startDate: p.promotion?.startDate ? p.promotion.startDate.split('T')[0] : "",
              endDate: p.promotion?.endDate ? p.promotion.endDate.split('T')[0] : ""
            }
          });

          // Restauration des images depuis le backend (Cloudinary ou local)
          const main = p.images?.find(img => img.isMain);
          if (main) {
            setImages(prev => ({
              ...prev,
              mainPreview: main.url.startsWith('http') ? main.url : `http://localhost:5000${main.url}`
            }));
          }
          
          // Tu pourras ajouter la restauration de la galerie ici si nécessaire plus tard
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Impossible de charger les données du produit.");
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      
      // Ajout des données textuelles
      Object.keys(form).forEach(key => {
        if (key === 'promotion') {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      });

      // Ajout des fichiers
      if (images.mainFile) formData.append("mainImage", images.mainFile);
      images.galleryFiles.forEach(file => formData.append("galleryImages", file));

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (isEdit) {
        await api.put(`/admin/products/${id}`, formData, config);
      } else {
        await api.post("/admin/products", formData, config);
      }

      navigate("/admin/products");
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement";
      setError(msg.includes("too large") ? "Une ou plusieurs images sont trop lourdes." : msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button type="button" onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-sm font-black uppercase tracking-tighter text-slate-800 italic">
            {isEdit ? "Modifier l'article" : "Nouveau Produit"}
          </h1>
          <div className="w-10"></div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold uppercase animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <ImageSection images={images} setImages={setImages} />
          
          <BasicInfoSection form={form} setForm={setForm} categories={categories} />
          
          <DescriptionSection form={form} setForm={setForm} />
          
          <PromotionSection form={form} setForm={setForm} />

          {/* Bouton de validation */}
          <div className="fixed bottom-6 left-4 right-4 md:static z-20">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 hover:bg-indigo-700"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              {isEdit ? "Mettre à jour l'article" : "Enregistrer le produit"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}