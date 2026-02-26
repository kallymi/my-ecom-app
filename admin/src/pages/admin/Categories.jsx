import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, Edit3, Trash2, Tag, Loader2, Layers, 
  AlertCircle, Image as ImageIcon, ChevronRight 
} from "lucide-react";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/admin/categories");
      const finalData = data.categories || data.data || [];
      setCategories(finalData);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const deleteCategory = async (id) => {
    if (!window.confirm("Supprimer cette catégorie ? Tous les produits associés pourraient perdre leur classement.")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Structuration du catalogue...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-[1000] italic tracking-tighter uppercase leading-none">
            Rayonnages<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
            <Layers size={14} /> {categories.length} segments configurés
          </p>
        </div>
        <Link
          to="/admin/categories/new"
          className="w-full sm:w-auto bg-black hover:bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> Créer un segment
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 rounded-[1.5rem] shadow-sm animate-in zoom-in duration-300">
          <AlertCircle size={20} />
          <p className="font-black text-[10px] uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* TABLEAU / GRID RESPONSIVE */}
      <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="hidden md:table-row bg-gray-50/50">
                <th className="px-10 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Identité visuelle</th>
                <th className="px-10 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Hiérarchie</th>
                <th className="px-10 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">Contrôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Tag size={64} strokeWidth={1} />
                      <p className="text-[11px] font-black uppercase tracking-[0.4em]">Catalogue vide</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="flex flex-col md:table-row hover:bg-indigo-50/20 transition-all group">
                    {/* NOM ET IMAGE */}
                    <td className="px-6 md:px-10 py-5 md:py-8">
                      <div className="flex items-center gap-5">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-gray-100 overflow-hidden border-2 border-white shadow-md group-hover:rotate-3 transition-transform duration-500 shrink-0">
                          {cat.image?.url ? (
                            <img 
                              src={cat.image.url.startsWith('http') ? cat.image.url : `http://localhost:5000${cat.image.url}`} 
                              className="w-full h-full object-cover" 
                              alt="" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={24} strokeWidth={1} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="md:hidden text-[8px] font-black text-indigo-400 uppercase mb-1">Catégorie</p>
                          <span className="font-[1000] text-gray-900 uppercase text-lg md:text-xl italic tracking-tighter leading-none">
                            {cat.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* PARENT / HIERARCHIE */}
                    <td className="px-6 md:px-10 py-2 md:py-8">
                      <div className="flex flex-col">
                        <p className="md:hidden text-[8px] font-black text-gray-400 uppercase mb-1 tracking-widest">Niveau</p>
                        {cat.parent ? (
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-black text-[9px] uppercase tracking-widest border border-indigo-100 self-start">
                            <Layers size={12} /> {cat.parent.name}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-400 rounded-full font-black text-[9px] uppercase tracking-widest self-start">
                             Top Level
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 md:px-10 py-6 md:py-8">
                      <div className="flex md:justify-end gap-3">
                        <button
                          onClick={() => navigate(`/admin/categories/${cat._id}/edit`)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-100 rounded-2xl shadow-sm hover:shadow-indigo-100 hover:border-indigo-200 transition-all font-black text-[10px] uppercase tracking-widest active:scale-90"
                        >
                          <Edit3 size={16} className="text-indigo-500" /> Modifier
                        </button>
                        <button
                          onClick={() => deleteCategory(cat._id)}
                          className="p-3.5 bg-white text-gray-300 hover:text-red-500 hover:bg-red-50 border border-gray-50 hover:border-red-100 rounded-2xl transition-all active:scale-90"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="flex justify-center md:justify-start items-center gap-4 text-gray-300 py-6">
         <div className="h-px w-12 bg-gray-100 hidden md:block"></div>
         <p className="text-[9px] font-black uppercase tracking-[0.4em]">Structure de navigation optimisée pour le SEO</p>
      </div>
    </div>
  );
}