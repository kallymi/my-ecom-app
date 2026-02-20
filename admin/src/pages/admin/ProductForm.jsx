import { useEffect, useState } from "react";
import ReactQuill from 'react-quill-new';
import "react-quill-new/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Save, ArrowLeft, Image as ImageIcon, Loader2, 
  Plus, X, Tag, Calendar, Package, Info, Clock
} from "lucide-react";
import api from "../../api/axios";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState([]);

  // États pour les images
  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: 0,
    category: "",
    description: "",
    returnDelay: 7,
    promotion: {
      isActive: false,
      type: "percentage",
      value: 0,
      startDate: "",
      endDate: ""
    }
  });

  // 1. Chargement des données (Catégories + Produit si Edit)
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

          // Gestion des images existantes
          setExistingImages(p.images || []);
          const main = p.images?.find(img => img.isMain);
          if (main) setMainPreview(`http://localhost:5000${main.url}`);
        }
      } catch (err) {
        console.error("Erreur init:", err);
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id, isEdit]);

  // 2. Gestion des fichiers
  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      setMainPreview(URL.createObjectURL(file));
    }
  };

  const handleGallery = (e) => {
    const files = Array.from(e.target.files);
    setGalleryImages(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  // 3. Envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", Number(form.price));
      formData.append("stock", Number(form.stock));
      formData.append("category", form.category._id || form.category);
      formData.append("description", form.description);
      formData.append("returnDelay", Number(form.returnDelay || 7));
      // On envoie l'objet promotion stringifié pour le backend
      formData.append("promotion", JSON.stringify(form.promotion));

      if (mainImage && mainImage instanceof File) {
        formData.append("mainImage", mainImage);
      }

      galleryImages.forEach(file => {
        if (file instanceof File) {
          formData.append("galleryImages", file);
        }
      });

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (isEdit) {
        await api.put(`/admin/products/${id}`, formData, config);
      } else {
        await api.post("/admin/products", formData, config);
      }

      navigate("/admin/products");
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
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
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-12">
          <button onClick={() => navigate("/admin/products")} className="flex items-center text-gray-400 hover:text-gray-900 transition-colors font-black uppercase text-[10px] tracking-[0.3em]">
            <ArrowLeft size={16} className="mr-2" /> Retour
          </button>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
            {isEdit ? "Modifier le produit" : "Ajouter au catalogue"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLONNE GAUCHE : IMAGES */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Image Principale */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Image de couverture</label>
              <div className="relative aspect-square rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group">
                {mainPreview ? (
                  <img src={mainPreview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <ImageIcon size={40} className="text-gray-200" />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-black uppercase">
                  <input type="file" hidden onChange={handleMainImage} accept="image/*" />
                  <Plus size={24} className="mb-2" /> Changer l'image
                </label>
              </div>
            </div>

            {/* Galerie */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Galerie photos</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {galleryPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => {
                      setGalleryImages(prev => prev.filter((_, idx) => idx !== i));
                      setGalleryPreviews(prev => prev.filter((_, idx) => idx !== i));
                    }} className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-md">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:text-indigo-500 hover:border-indigo-500 cursor-pointer transition-colors">
                  <input type="file" hidden multiple onChange={handleGallery} accept="image/*" />
                  <Plus size={20} />
                </label>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : INFOS & PROMO */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Infos Générales */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nom du produit</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg" placeholder="ex: MacBook Pro M3..." />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Prix (FCFA)</label>
                  <input type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Stock initial</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-black" />
                </div>
                {/* NOUVEAU CHAMP : DÉLAI DE RETOUR */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <Clock size={12} className="text-indigo-400" /> {/* 👈 Utilise Clock au lieu de ClockIcon */}
                    Délai de retour (Jours)
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      value={form.returnDelay} 
                      onChange={e => setForm({...form, returnDelay: e.target.value})} 
                      className="w-full px-8 py-5 rounded-2xl bg-indigo-50 border-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-600"
                      placeholder="7"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-300 uppercase">Jours</span>
                  </div>
                </div>
              </div>


              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Catégorie</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none">
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2 quill-container">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description</label>
                <ReactQuill 
                  theme="snow"
                  value={form.description}
                  onChange={(content) => setForm({...form, description: content})}
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{'list': 'ordered'}, {'list': 'bullet'}],
                      ['clean']
                    ],
                  }}
                  className="bg-gray-50 rounded-[2rem] overflow-hidden border-none"
                />
              </div>
            </div>

            {/* Section Promotion (Alignée Backend) */}
            <div className={`p-10 rounded-[3rem] border-2 transition-all ${form.promotion.isActive ? 'bg-rose-50/50 border-rose-100 shadow-xl shadow-rose-100/20' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${form.promotion.isActive ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-sm tracking-tight text-gray-900">Offre Promotionnelle</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Booster les ventes sur ce produit</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={form.promotion.isActive} onChange={e => setForm({...form, promotion: {...form.promotion, isActive: e.target.checked}})} />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {form.promotion.isActive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-2">Type de remise</label>
                    <select value={form.promotion.type} onChange={e => setForm({...form, promotion: {...form.promotion, type: e.target.value}})} className="w-full px-6 py-4 rounded-xl bg-white border-none shadow-sm font-black text-rose-600">
                      <option value="percentage">Pourcentage (%)</option>
                      <option value="fixed">Montant Fixe (FCFA)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-2">Valeur de la remise</label>
                    <input type="number" value={form.promotion.value} onChange={e => setForm({...form, promotion: {...form.promotion, value: e.target.value}})} className="w-full px-6 py-4 rounded-xl bg-white border-none shadow-sm font-black text-rose-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Calendar size={12}/> Date de début</label>
                    <input type="date" value={form.promotion.startDate} onChange={e => setForm({...form, promotion: {...form.promotion, startDate: e.target.value}})} className="w-full px-6 py-4 rounded-xl bg-white border-none shadow-sm font-bold text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2"><Calendar size={12}/> Date de fin</label>
                    <input type="date" value={form.promotion.endDate} onChange={e => setForm({...form, promotion: {...form.promotion, endDate: e.target.value}})} className="w-full px-6 py-4 rounded-xl bg-white border-none shadow-sm font-bold text-gray-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Boutons Action */}
            <div className="flex items-center justify-end gap-6 pt-4">
              <button type="button" onClick={() => navigate("/admin/products")} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-rose-500 transition-colors">Annuler</button>
              <button type="submit" disabled={loading} className="flex items-center gap-3 px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Enregistrer le produit
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}