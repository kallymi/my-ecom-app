import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, ArrowLeft, Image as ImageIcon, Loader2, Plus, X, Tag, Package, Clock, Calendar } from "lucide-react";
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

  // États pour les fichiers
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  // État pour les images déjà présentes en base
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
        if (main) setMainPreview(main.url); // On suppose que l'URL est complète depuis Cloudinary
        
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
      
      // On envoie les images qu'on a décidé de GARDER (pour le backend)
      formData.append("existingImages", JSON.stringify(existingImages));
      formData.append("promotion", JSON.stringify(form.promotion));

      if (mainImageFile) formData.append("mainImage", mainImageFile);
      galleryFiles.forEach(file => formData.append("galleryImages", file));

      await api.put(`/admin/products/${id}`, formData);
      toast.success("Produit mis à jour avec succès !");
      navigate(`/admin/products`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };
  if (fetching) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-indigo-600 tracking-[0.3em]">CHARGEMENT...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <button onClick={() => navigate(-1)} className="group flex items-center text-gray-400 hover:text-indigo-600 font-black uppercase text-[10px] tracking-widest transition-all mb-2">
              <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Retour
            </button>
            <h1 className="text-4xl font-[1000] uppercase tracking-tighter text-gray-900 italic">
              Edit <span className="text-indigo-600">Product.</span>
            </h1>
          </div>
          <button form="edit-form" type="submit" disabled={loading} className="px-8 py-4 bg-gray-900 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-gray-200">
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            Sauvegarder les modifications
          </button>
        </header>

        <form id="edit-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLONNE GAUCHE : VISUELS & LOGISTIQUE */}
          <div className="lg:col-span-4 space-y-6">
            {/* MAIN IMAGE */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Image Principale</label>
              <div className="relative aspect-square rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group">
                <img src={mainPreview} className="w-full h-full object-cover" alt="Preview" />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                  <input type="file" hidden onChange={(e) => {
                    const file = e.target.files[0];
                    if(file) {
                      setMainImageFile(file);
                      setMainPreview(URL.createObjectURL(file));
                    }
                  }} accept="image/*" />
                  <Plus size={24} />
                  <span className="font-black text-[9px] uppercase mt-2 tracking-widest text-center px-4">Remplacer l'image</span>
                </label>
              </div>
            </div>

            {/* GALLERY EXISTING */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Galerie Photos</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {/* 1. Affichage des images déjà sur le serveur */}
                {existingImages.filter(img => !img.isMain).map((img, idx) => (
                  <div key={`old-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100">
                    <img src={img.url} className="w-full h-full object-cover" alt="Gallery" />
                    <button 
                      type="button"
                      onClick={() => handleRemoveExistingImage(img.public_id)}
                      className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {/* 2. Affichage des NOUVELLES images sélectionnées (Previews) */}
                {galleryFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-indigo-200">
                    <img 
                      src={URL.createObjectURL(file)} 
                      className="w-full h-full object-cover opacity-70" 
                      alt="New Preview" 
                    />
                    <button 
                      type="button"
                      onClick={() => setGalleryFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-1 right-1 bg-indigo-600 text-[8px] text-white px-1 rounded font-black uppercase">New</div>
                  </div>
                ))}

                {/* 3. Bouton d'ajout */}
                <label className="aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                  <input 
                    type="file" 
                    multiple 
                    hidden 
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setGalleryFiles(prev => [...prev, ...files]);
                    }} 
                    accept="image/*"
                  />
                  <Plus size={20} className="text-gray-300" />
                </label>
              </div>
              {galleryFiles.length > 0 && (
                 <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">+{galleryFiles.length} nouvelles images sélectionnées</p>
              )}
            </div>

            {/* LOGISTIQUE */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 text-gray-900 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Clock size={16} /></div>
                <span className="font-black uppercase text-[10px] tracking-widest">SAV & Retours</span>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Délai de retour (Jours)</label>
                <input 
                  type="number" 
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none font-black text-gray-900 focus:ring-2 focus:ring-indigo-500" 
                  value={form.returnDelay} 
                  onChange={e => setForm({...form, returnDelay: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : INFOS GÉNÉRALES & PROMO */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-8">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Titre du produit</label>
                <input className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-bold text-2xl focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Prix de vente (FCFA)</label>
                  <div className="relative">
                    <input type="number" className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-black text-indigo-600 text-xl" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Quantité en stock</label>
                  <input type="number" className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-black text-xl" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Catégorie</label>
                <select 
                  className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-bold cursor-pointer appearance-none" 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description</label>
                <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                  <ReactQuill 
                    theme="snow" 
                    value={form.description} 
                    onChange={(content) => setForm({...form, description: content})}
                    modules={modules}
                    className="border-none min-h-[200px]"
                  />
                </div>
              </div>

              {/* SECTION PROMOTION AMÉLIORÉE */}
              <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${form.promotion.isActive ? 'bg-rose-50/30 border-rose-100' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${form.promotion.isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-gray-200 text-gray-400'}`}>
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="font-black uppercase text-[12px] tracking-widest text-gray-900">Offre Promotionnelle</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Gérer les remises et dates limites</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer scale-110">
                    <input type="checkbox" className="sr-only peer" checked={form.promotion.isActive} onChange={e => setForm({...form, promotion: {...form.promotion, isActive: e.target.checked}})} />
                    <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:bg-rose-500 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:after:translate-x-7"></div>
                  </label>
                </div>

                {form.promotion.isActive && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-2">Valeur de la remise</label>
                        <input type="number" className="w-full p-4 rounded-xl border-none shadow-sm font-black text-rose-600 focus:ring-2 focus:ring-rose-500" value={form.promotion.value} onChange={e => setForm({...form, promotion: {...form.promotion, value: e.target.value}})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-2">Type de remise</label>
                        <select className="w-full p-4 rounded-xl border-none shadow-sm font-bold focus:ring-2 focus:ring-rose-500" value={form.promotion.type} onChange={e => setForm({...form, promotion: {...form.promotion, type: e.target.value}})}>
                          <option value="percentage">% Pourcentage</option>
                          <option value="fixed">Montant Fixe (FCFA)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                          <Calendar size={12} /> Début de la promo
                        </label>
                        <input type="date" className="w-full p-4 rounded-xl border-none shadow-sm font-bold" value={form.promotion.startDate} onChange={e => setForm({...form, promotion: {...form.promotion, startDate: e.target.value}})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                          <Calendar size={12} /> Fin de la promo
                        </label>
                        <input type="date" className="w-full p-4 rounded-xl border-none shadow-sm font-bold" value={form.promotion.endDate} onChange={e => setForm({...form, promotion: {...form.promotion, endDate: e.target.value}})} />
                      </div>
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