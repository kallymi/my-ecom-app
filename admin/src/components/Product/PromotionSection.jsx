import { Tag, Calendar } from "lucide-react";

export default function PromotionSection({ form, setForm }) {
  const handlePromoChange = (field, value) => {
    setForm({
      ...form,
      promotion: { ...form.promotion, [field]: value }
    });
  };

  return (
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
        
        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={form.promotion.isActive} 
            onChange={(e) => handlePromoChange('isActive', e.target.checked)} 
          />
          <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-rose-500 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
      </div>

      {form.promotion.isActive && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-rose-400 uppercase tracking-widest ml-2">Type</label>
              <select 
                value={form.promotion.type} 
                onChange={(e) => handlePromoChange('type', e.target.value)} 
                className="w-full px-4 py-3 rounded-xl bg-white border border-rose-100 font-bold text-xs text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="percentage">% Pourcentage</option>
                <option value="fixed">Montant fixe</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-rose-400 uppercase tracking-widest ml-2">Valeur</label>
              <input 
                type="number" 
                value={form.promotion.value} 
                onChange={(e) => handlePromoChange('value', e.target.value)} 
                className="w-full px-4 py-3 rounded-xl bg-white border border-rose-100 font-black text-rose-600 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                <Calendar size={10}/> Début
              </label>
              <input 
                type="date" 
                value={form.promotion.startDate} 
                onChange={(e) => handlePromoChange('startDate', e.target.value)} 
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 font-bold text-[10px] focus:outline-none focus:ring-2 focus:ring-slate-200" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                <Calendar size={10}/> Fin
              </label>
              <input 
                type="date" 
                value={form.promotion.endDate} 
                onChange={(e) => handlePromoChange('endDate', e.target.value)} 
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-100 font-bold text-[10px] focus:outline-none focus:ring-2 focus:ring-slate-200" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}