import React, { useEffect, useState } from "react";
import { productService } from "../../services/productService";
import { RefreshCcw, Trash2, PackageSearch, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const TrashPage = () => {
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrash();
  }, []);

  const loadTrash = async () => {
    try {
      setLoading(true);
      const response = await productService.getTrash();
      // On s'adapte à ton controller qui renvoie { success: true, products: [] }
      setTrashItems(response.products || []);
    } catch (error) {
      toast.error("Erreur lors du chargement de la corbeille");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await productService.restoreProduct(id);
      toast.success("Produit restauré avec succès !");
      loadTrash();
    } catch (error) {
      toast.error("Erreur lors de la restauration");
    }
  };

  const handlePermanentDelete = async (id) => {
    if (window.confirm("⚠️ DÉFINITIF : Supprimer ce produit à jamais ?")) {
      try {
        await productService.deletePermanent(id);
        toast.success("Produit éliminé définitivement");
        loadTrash();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link to="/admin/products" className="text-slate-400 hover:text-indigo-600 flex items-center gap-2 text-sm font-bold mb-2 transition-colors">
            <ArrowLeft size={16} /> Retour aux produits
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
            Corbeille <span className="text-indigo-600">Produits</span>
          </h1>
          <p className="text-slate-500 font-medium">Gérez les articles supprimés temporairement</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-2xl font-black text-indigo-600">{trashItems.length}</span>
          <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Articles</span>
        </div>
      </div>

      {trashItems.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-50 p-6 rounded-full mb-6">
            <PackageSearch size={48} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">La corbeille est vide</h3>
          <p className="text-slate-400 mt-2">Aucun produit ne se trouve ici pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trashItems.map((product) => (
            <div key={product._id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-500">
              
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden bg-slate-100">
                <img 
                  src={`http://localhost:5000${product.images?.find(img => img.isMain)?.url || product.images?.[0]?.url}`} 
                  alt={product.name}
                  className="w-full h-full object-cover opacity-80 grayscale-[0.5] group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {product.category?.name || "Sans catégorie"}
                  </span>
                </div>
              </div>

              {/* Info Container */}
              <div className="p-6">
                <h3 className="font-black text-slate-900 uppercase tracking-tight truncate mb-1">
                  {product.name}
                </h3>
                <p className="text-indigo-600 font-black text-lg mb-6">
                  {product.price?.toLocaleString()} <small className="text-[10px] uppercase tracking-normal">FCFA</small>
                </p>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleRestore(product._id)}
                    className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all duration-300"
                  >
                    <RefreshCcw size={14} /> Restaurer
                  </button>
                  <button 
                    onClick={() => handlePermanentDelete(product._id)}
                    className="flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold text-xs hover:bg-rose-600 hover:text-white transition-all duration-300"
                  >
                    <Trash2 size={14} /> Détruire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrashPage;