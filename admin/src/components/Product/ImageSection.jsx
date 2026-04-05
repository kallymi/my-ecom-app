import { Image as ImageIcon, X, Plus } from "lucide-react";

export default function ImageSection({ images, setImages }) {
  // Gestion Image Principale
  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("L'image est trop lourde (max 10Mo)");
        return;
      }
      setImages((prev) => ({
        ...prev,
        mainFile: file,
        mainPreview: URL.createObjectURL(file),
      }));
    }
  };

  // Gestion Galerie
  const handleGallery = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop lourd.`);
        return false;
      }
      return true;
    });

    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    
    setImages((prev) => ({
      ...prev,
      galleryFiles: [...prev.galleryFiles, ...validFiles],
      galleryPreviews: [...prev.galleryPreviews, ...newPreviews],
    }));
  };

  // Suppression d'une image de la galerie
  const removeGalleryImage = (indexToRemove) => {
    setImages((prev) => ({
      ...prev,
      galleryFiles: prev.galleryFiles.filter((_, i) => i !== indexToRemove),
      galleryPreviews: prev.galleryPreviews.filter((_, i) => i !== indexToRemove),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Section Image Principale */}
      <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-4">
          Photo principale
        </label>
        <div className="relative aspect-square rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group">
          {images.mainPreview ? (
            <img src={images.mainPreview} className="w-full h-full object-cover" alt="Preview" />
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
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-2">
          Galerie photos
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.galleryPreviews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100">
              <img src={src} className="w-full h-full object-cover" alt="Gallery preview" />
              <button
                type="button"
                onClick={() => removeGalleryImage(i)}
                className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-lg hover:bg-rose-600 transition-colors"
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
    </div>
  );
}