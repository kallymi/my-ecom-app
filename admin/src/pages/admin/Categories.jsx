import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit3, Trash2, Tag, Loader2, Layers, AlertCircle } from "lucide-react";

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
      
      // Sécurité sur la structure des données
      const finalData = data.categories || data.data || [];
      setCategories(finalData);
    } catch (err) {
      console.error("Erreur API:", err);
      setError(err.response?.data?.message || "Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deleteCategory = async (id) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Structure Catalogue</h1>
          <p className="text-gray-500 text-sm">Gérez vos catégories et sous-catégories.</p>
        </div>
        <Link
          to="/admin/categories/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          <Plus size={18} /> Nouvelle Catégorie
        </Link>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3 rounded-r-xl">
          <AlertCircle size={20} />
          <p className="font-bold text-sm">{error} (Vérifiez votre connexion admin)</p>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Désignation</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parent</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-24 text-center">
                    {/* CORRECTION : Utilisation correcte du composant <Tag /> */}
                    <Tag size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Aucune catégorie trouvée</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-100">
                          {cat.image?.url ? (
                            <img 
                              src={cat.image.url.startsWith('http') ? cat.image.url : `http://localhost:5000${cat.image.url}`} 
                              className="w-full h-full object-cover" 
                              alt={cat.name} 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Tag size={18} />
                            </div>
                          )}
                        </div>
                        <span className="font-black text-gray-900 uppercase text-sm tracking-tight">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {cat.parent ? (
                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase">
                          <Layers size={14} /> {cat.parent.name || "Sous-cat"}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-gray-300 uppercase">Racine</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/categories/${cat._id}/edit`)}
                          className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-indigo-100 transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat._id)}
                          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all"
                        >
                          <Trash2 size={18} />
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
    </div>
  );
}