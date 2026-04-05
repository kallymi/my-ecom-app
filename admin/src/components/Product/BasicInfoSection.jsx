import { Clock } from "lucide-react";

export default function BasicInfoSection({ form, setForm, categories }) {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-5">
      <div className="space-y-1">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nom du produit</label>
        <input 
          required 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm" 
          placeholder="ex: MacBook Pro..." 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Prix (FCFA)</label>
          <input 
            type="number" 
            required 
            name="price" 
            value={form.price} 
            onChange={handleChange} 
            className="w-full px-6 py-4 rounded-2xl bg-indigo-50/50 border-none font-black text-indigo-600" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Stock initial</label>
          <input 
            type="number" 
            name="stock" 
            value={form.stock} 
            onChange={handleChange} 
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-black" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Catégorie</label>
          <select 
            name="category" 
            value={form.category} 
            onChange={handleChange} 
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold text-xs"
          >
            <option value="">Choisir...</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-1">
            <Clock size={10}/> Délai Retour (Jours)
          </label>
          <input 
            type="number" 
            name="returnDelay" 
            value={form.returnDelay} 
            onChange={handleChange} 
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-black" 
          />
        </div>
      </div>
    </div>
  );
}