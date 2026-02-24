import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Save, ArrowLeft, Loader2, Plus, X, Tag, 
  Clock, Calendar, Sparkles, Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);

  // États pour les fichiers et previews
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [mainPreview, setMainPreview] = useState(null);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resProd, resCats] = await Promise.all([
          api.get(`/admin/products/${id}`),
          api.get("/admin/categories")
        ]);

        const p = resProd.data.product;
        setCategories(resCats.data.categories || resCats.data);
        setExistingImages(p.images || []);

        setForm({
          name: p.name,
          price: p.price,
          stock: p.stock,
          category: p.category?._id || p.category,
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

        const main = p.images?.find(img => img.isMain);
        if (main) setMainPreview(main.url);
        
      } catch (err) {
        toast.error("Erreur de chargement des données");
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, [id]);

  const handleRemoveExistingImage = (public_id) => {
    setExistingImages(prev => prev.filter(img => img.public_id !== public_id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("returnDelay", form.returnDelay);
      formData.append("existingImages", JSON.stringify(existingImages));
      formData.append("promotion", JSON.stringify(form.promotion));

      if (mainImageFile) formData.append("mainImage", mainImageFile);
      galleryFiles.forEach(file => formData.append("galleryImages", file));

      await api.put(`/admin/products/${id}`, formData);
      toast.success("Produit mis à jour !");
      navigate(`/admin/products`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400">Initialisation</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER FIXE --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-gray-400 hover:text-indigo-600 font-bold uppercase text-[10px] tracking-[0.2em] transition-all group"
            >
              <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
              Retour Catalogue
            </button>
            <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter text-slate-900 uppercase italic leading-none">
              Edition<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">Identifiant unique: <span className="font-mono text-indigo-400">#{id.slice(-6)}</span></p>
          </div>

          <button 
            form="edit-form" 
            disabled={loading}
            className="group relative px-8 py-4 bg-slate-900 overflow-hidden text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200 disabled:opacity-70"
          >
            <div className="relative z-10 flex items-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>Mettre à jour le produit</span>
            </div>
          </button>
        </header>

        <form id="edit-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- COLONNE GAUCHE (Media & Stats) --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Image Principale */}
            <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden group bg-slate-50">
                <img src={mainPreview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Principale" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 text-center">
                  <input type="file" id="main-upload" hidden onChange={(e) => {
                    const file = e.target.files[0];
                    if(file) {
                      setMainImageFile(file);
                      setMainPreview(URL.createObjectURL(file));
                    }
                  }} accept="image/*" />
                  <label htmlFor="main-upload" className="cursor-pointer bg-white text-slate-900 p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
                    <ImageIcon size={24} />
                  </label>
                  <p className="text-white font-black text-[10px] uppercase tracking-widest mt-4">Changer l'image vedette</p>
                </div>
                <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Principale</div>
              </div>
            </div>

            {/* Galerie Multi-images */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Galerie Additionnelle</h3>
              <div className="grid grid-cols-3 gap-3">
                {/* Images Existantes */}
                {existingImages.filter(img => !img.isMain).map((img, idx) => (
                  <div key={`old-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100 bg-slate-50">
                    <img src={img.url} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" alt="Gallery" />
                    <button type="button" onClick={() => handleRemoveExistingImage(img.public_id)} className="absolute inset-0 bg-rose-500/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <X size={18} />
                    </button>
                  </div>
                ))}

                {/* Nouvelles Images */}
                {galleryFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-indigo-500/30">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="New" />
                    <button type="button" onClick={() => setGalleryFiles(prev => prev.filter((_, i) => i !== idx))} className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <X size={18} />
                    </button>
                    <div className="absolute bottom-1 right-1 bg-indigo-500 w-2 h-2 rounded-full"></div>
                  </div>
                ))}

                {/* Bouton Upload */}
                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all text-slate-300 hover:text-indigo-500">
                  <input type="file" multiple hidden onChange={(e) => setGalleryFiles(prev => [...prev, ...Array.from(e.target.files)])} accept="image/*" />
                  <Plus size={20} />
                </label>
              </div>
            </div>

            {/* Logistique rapide */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-indigo-400" size={20} />
                <span className="font-black uppercase text-[10px] tracking-widest text-indigo-200">Politique de retour</span>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  className="w-full bg-white/10 border-none rounded-2xl py-4 px-6 text-2xl font-black focus:ring-2 focus:ring-indigo-400 transition-all"
                  value={form.returnDelay}
                  onChange={e => setForm({...form, returnDelay: e.target.value})}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-[10px] uppercase text-white/40">Jours</span>
              </div>
            </div>
          </div>

          {/* --- COLONNE DROITE (Contenu & Prix) --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
              
              {/* Nom du produit */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                  <Sparkles size={12} className="text-indigo-500" /> Nom de l'article
                </label>
                <input 
                  className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border-transparent font-bold text-3xl focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Ex: iPhone 15 Pro Max..."
                />
              </div>

              {/* Prix et Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-transparent focus-within:border-indigo-100 transition-all">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Prix (FCFA)</label>
                  <input 
                    type="number" 
                    className="w-full bg-transparent border-none p-0 text-3xl font-[1000] text-indigo-600 focus:ring-0 outline-none" 
                    value={form.price} 
                    onChange={e => setForm({...form, price: e.target.value})} 
                  />
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-transparent focus-within:border-indigo-100 transition-all">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Stock disponible</label>
                  <input 
                    type="number" 
                    className="w-full bg-transparent border-none p-0 text-3xl font-[1000] text-slate-900 focus:ring-0 outline-none" 
                    value={form.stock} 
                    onChange={e => setForm({...form, stock: e.target.value})} 
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Classification</label>
                <select 
                  className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-none font-bold cursor-pointer hover:bg-slate-100 transition-colors appearance-none" 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description détaillée</label>
                <div className="rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50">
                  <ReactQuill 
                    theme="snow" 
                    value={form.description} 
                    onChange={(val) => setForm({...form, description: val})}
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Bloc Promotion */}
              <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${form.promotion.isActive ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${form.promotion.isActive ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-200 text-slate-400'}`}>
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="font-black uppercase text-xs tracking-widest text-slate-900">Campagne de promotion</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Booster les ventes de cet article</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={form.promotion.isActive} onChange={e => setForm({...form, promotion: {...form.promotion, isActive: e.target.checked}})} />
                    <div className="w-14 h-7 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:after:translate-x-7"></div>
                  </label>
                </div>

                {form.promotion.isActive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2 lg:col-span-1">
                      <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Valeur</label>
                      <input type="number" className="w-full p-4 rounded-xl border-none shadow-inner font-black bg-white" value={form.promotion.value} onChange={e => setForm({...form, promotion: {...form.promotion, value: e.target.value}})} />
                    </div>
                    <div className="space-y-2 lg:col-span-1">
                      <label className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Type</label>
                      <select className="w-full p-4 rounded-xl border-none shadow-inner font-bold bg-white" value={form.promotion.type} onChange={e => setForm({...form, promotion: {...form.promotion, type: e.target.value}})}>
                        <option value="percentage">%</option>
                        <option value="fixed">Montant</option>
                      </select>
                    </div>
                    <div className="space-y-2 lg:col-span-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10} /> Début</label>
                      <input type="date" className="w-full p-4 rounded-xl border-none shadow-inner font-bold bg-white text-[11px]" value={form.promotion.startDate} onChange={e => setForm({...form, promotion: {...form.promotion, startDate: e.target.value}})} />
                    </div>
                    <div className="space-y-2 lg:col-span-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10} /> Fin</label>
                      <input type="date" className="w-full p-4 rounded-xl border-none shadow-inner font-bold bg-white text-[11px]" value={form.promotion.endDate} onChange={e => setForm({...form, promotion: {...form.promotion, endDate: e.target.value}})} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}