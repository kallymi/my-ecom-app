import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Save, 
  ArrowLeft, 
  Image as ImageIcon, 
  CheckCircle2, 
  Loader2, 
  Info, 
  Tag, 
  Layers 
} from "lucide-react";
import api from "../../api/axios";

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    parent: "",
    featured: false,
  });

  /* ==========================================================
     1. CHARGEMENT DES DONNÉES
  ========================================================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger toutes les catégories pour le sélecteur parent
        const resCats = await api.get("/admin/categories");
        // On s'adapte à ta structure { success: true, categories: [...] }
        const listCats = resCats.data.categories || resCats.data.data || [];
        setCategories(listCats);

        if (isEdit) {
          const { data } = await api.get(`/admin/categories/${id}`);
          // On s'adapte à la structure retournée par ton contrôleur
          const cat = data.category || data.data || {};
          
          setForm({
            name: cat.name || "",
            description: cat.description || "",
            parent: cat.parent?._id || cat.parent || "",
            featured: cat.featured || false,
          });

          // Gestion de la prévisualisation de l'image existante
          if (cat.image?.url) {
            const fullUrl = cat.image.url.startsWith('http') 
              ? cat.image.url 
              : `http://localhost:5000${cat.image.url}`;
            setImagePreview(fullUrl);
          }
        }
      } catch (err) {
        console.error("Erreur fetchData:", err);
        alert("Impossible de charger les données");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  /* ==========================================================
     2. SOUMISSION DU FORMULAIRE
  ========================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      
      // On envoie une chaîne vide si pas de parent, le backend transformera en null
      data.append("parent", form.parent || ""); 
      data.append("featured", form.featured);
      
      if (imageFile) {
        data.append("image", imageFile);
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" }
      };

      if (isEdit) {
        await api.put(`/admin/categories/${id}`, data, config);
      } else {
        await api.post("/admin/categories", data, config);
      }

      navigate("/admin/categories");
    } catch (err) {
      console.error("Erreur save:", err);
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate("/admin/categories")} 
          className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Retour aux catégories
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            {isEdit ? "Modifier" : "Nouvelle"} catégorie
          </h1>
          <p className="text-gray-500 font-medium text-sm">Configurez l'organisation et le visuel de votre catalogue.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE : IMAGE & STATUS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Image de couverture</label>
              
              <div className="relative aspect-square rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-indigo-300">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="mx-auto text-gray-300 mb-2" size={40} />
                    <p className="text-[10px] text-gray-400 font-bold px-4 tracking-tighter uppercase">Formats: JPG, PNG, WEBP</p>
                  </div>
                )}
                <label className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }} 
                  />
                  <ImageIcon size={24} className="mb-2" />
                  <span className="font-bold text-[10px] uppercase tracking-widest">Mettre à jour</span>
                </label>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 tracking-tight">Mettre à la une</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Section accueil</p>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({...form, featured: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : INFOS */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
              
              {/* Nom */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} className="text-indigo-500" /> Nom de la catégorie
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900"
                  placeholder="Ex: Électronique"
                />
              </div>

              {/* Parent */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={14} className="text-indigo-500" /> Emplacement (Parent)
                </label>
                <div className="relative">
                  <select
                    value={form.parent}
                    onChange={(e) => setForm({...form, parent: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                  >
                    <option value="">-- Catégorie Racine (Principale) --</option>
                    {categories
                      .filter(c => c._id !== id) // Empêcher de devenir son propre parent
                      .map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))
                    }
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Tag size={16} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} className="text-indigo-500" /> Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl ring-1 ring-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-gray-700 resize-none"
                  placeholder="Informations complémentaires..."
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-6">
                <button
                  type="button"
                  onClick={() => navigate("/admin/categories")}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Save size={18} />
                      {isEdit ? "Mettre à jour" : "Créer la catégorie"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}