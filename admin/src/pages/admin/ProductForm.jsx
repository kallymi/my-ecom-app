import { useEffect, useState } from "react";
import ReactQuill from 'react-quill-new';
import "react-quill-new/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Save, ArrowLeft, Image as ImageIcon, Loader2, 
  Plus, X, Tag, Calendar, Clock, AlertCircle
} from "lucide-react";
import api from "../../api/axios";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  // États pour les images
  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [form, setForm] = useState({
    name: "", price: "", stock: 0, category: "",
    description: "", returnDelay: 7,
    promotion: { isActive: false, type: "percentage", value: 0, startDate: "", endDate: "" }
  });

  // 1. Initialisation des données
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
          // Gestion preview image existante (Cloudinary)
          const main = p.images?.find(img => img.isMain);
          if (main) setMainPreview(main.url.startsWith('http') ? main.url : `http://localhost:5000${main.url}`);
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

  // 2. Gestion Image Principale
  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("L'image est trop lourde (max 10Mo)");
        return;
      }
      setMainImage(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  // 3. Gestion Galerie (Correction de l'erreur ReferenceError)
  const handleGallery = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop lourd.`);
        return false;
      }
      return true;
    });

    setGalleryImages(prev => [...prev, ...validFiles]);
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  // 4. Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("returnDelay", form.returnDelay);
      formData.append("promotion", JSON.stringify(form.promotion));

      if (mainImage) formData.append("mainImage", mainImage);
      galleryImages.forEach(file => formData.append("galleryImages", file));

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (isEdit) {
        await api.put(`/admin/products/${id}`, formData, config);
      } else {
        await api.post("/admin/products", formData, config);
      }

      navigate("/admin/products");
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement";
      setError(msg.includes("too large") ? "Une ou plusieurs images sont trop lourdes pour le serveur." : msg);
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
          <button type="button" onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-sm font-black uppercase tracking-tighter text-slate-800 italic">
            {isEdit ? "Modifier l'article" : "Nouveau Produit"}
          </h1>
          <div className="w-10"></div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold uppercase">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section Image Principale */}
          <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-4">Photo principale</label>
            <div className="relative aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
              {mainPreview ? (
                <img src={mainPreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="text-center">
                  <ImageIcon size={40} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Cliquez pour ajouter</p>
                </div>
              )}
              <input type="file" hidden id="mainImg" onChange={handleMainImage} accept="image/*" />
              <label htmlFor="mainImg" className="absolute inset-0 cursor-pointer z-10"></label>
            </div>
          </div>

          {/* Section Galerie Additionnelle */}
          <div className="bg-white p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-2">Galerie photos</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {galleryPreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100">
                  <img src={src} className="w-full h-full object-cover" alt="Gallery preview" />
                  <button 
                    type="button" 
                    onClick={() => {
                      setGalleryImages(prev => prev.filter((_, idx) => idx !== i));
                      setGalleryPreviews(prev => prev.filter((_, idx) => idx !== i));
                    }} 
                    className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:text-indigo-500 cursor-pointer transition-all bg-slate-50/50">
                <input type="file" hidden multiple onChange={handleGallery} accept="image/*" />
                <Plus size={24} />
                <span className="text-[8px] font-black mt-1">AJOUTER</span>
              </label>
            </div>
          </div>

          {/* Formulaire Infos */}
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nom du produit</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" placeholder="ex: MacBook Pro..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Prix (FCFA)</label>
                <input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-indigo-50/50 border-none font-black text-indigo-600" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Stock initial</label>
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-black" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Catégorie</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold text-xs">
                  <option value="">Choisir...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-1"><Clock size={10}/> Délai Retour (Jours)</label>
                <input type="number" value={form.returnDelay} onChange={e => setForm({...form, returnDelay: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-black" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
              <div className="rounded-2xl overflow-hidden border border-slate-100">
                <ReactQuill theme="snow" value={form.description} onChange={(c) => setForm({...form, description: c})} className="bg-slate-50" />
              </div>
            </div>
          </div>

          {/* Section Promotion */}
          <div className={`p-6 md:p-10 rounded-[2.5rem] border-2 transition-all duration-300 ${form.promotion.isActive ? 'bg-rose-50/30 border-rose-100' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${form.promotion.isActive ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="font-black uppercase text-[11px] tracking-tight text-slate-900">Promotion</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase italic">Activer une remise</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={form.promotion.isActive} onChange={e => setForm({...form, promotion: {...form.promotion, isActive: e.target.checked}})} />
                <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-rose-500 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            {form.promotion.isActive && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-rose-400 uppercase tracking-widest ml-2">Type</label>
                    <select value={form.promotion.type} onChange={e => setForm({...form, promotion: {...form.promotion, type: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-white border border-rose-100 font-bold text-xs text-rose-600">
                      <option value="percentage">% Pourcentage</option>
                      <option value="fixed">Montant fixe</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-rose-400 uppercase tracking-widest ml-2">Valeur</label>
                    <input type="number" value={form.promotion.value} onChange={e => setForm({...form, promotion: {...form.promotion, value: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-white border border-rose-100 font-black text-rose-600 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1"><Calendar size={10}/> Début</label>
                    <input type="date" value={form.promotion.startDate} onChange={e => setForm({...form, promotion: {...form.promotion, startDate: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 font-bold text-[10px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1"><Calendar size={10}/> Fin</label>
                    <input type="date" value={form.promotion.endDate} onChange={e => setForm({...form, promotion: {...form.promotion, endDate: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 font-bold text-[10px]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bouton de validation */}
          <div className="fixed bottom-6 left-4 right-4 md:static">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50"
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