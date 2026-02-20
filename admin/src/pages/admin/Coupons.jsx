import { useEffect, useState } from "react";
import api from "../../api/axios";
import { 
  TicketIcon, 
  PlusIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/outline";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "PERCENT",
    discountValue: "",
    minOrderAmount: 0,
    expirationDate: "",
    isActive: true
  });

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/admin/coupons");
      setCoupons(res.data || []);
    } catch (err) {
      console.error("Erreur coupons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/coupons", newCoupon);
      fetchCoupons();
      setShowModal(false);
      setNewCoupon({ code: "", discountType: "PERCENT", discountValue: "", minOrderAmount: 0, expirationDate: "", isActive: true });
    } catch (err) {
      alert("Erreur lors de la création");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/coupons/${id}`, { isActive: !currentStatus });
      fetchCoupons();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8 space-y-8 bg-[#F8F9FA] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-[1000] italic tracking-tighter uppercase">PROMOS.</h1>
          <p className="text-gray-400 font-medium">Boostez vos ventes avec des codes de réduction</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-2 hover:bg-indigo-600 transition-all"
        >
          <PlusIcon className="h-5 w-5" /> CRÉER UN CODE
        </button>
      </div>

      {/* GRID DE COUPONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div key={c._id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
            {/* Déco Ticket */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-[#F8F9FA] rounded-full border border-gray-100"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${c.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                <TicketIcon className="h-6 w-6" />
              </div>
              <button 
                onClick={() => toggleStatus(c._id, c.isActive)}
                className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${c.isActive ? 'border-emerald-200 text-emerald-600' : 'border-gray-200 text-gray-400'}`}
              >
                {c.isActive ? 'Actif' : 'Désactivé'}
              </button>
            </div>

            <h3 className="text-2xl font-black tracking-widest text-indigo-600 mb-2">{c.code}</h3>
            <p className="font-bold text-gray-900">
              -{c.discountValue}{c.discountType === "PERCENT" ? "%" : " F"} sur la commande
            </p>
            
            <div className="mt-6 pt-6 border-t border-dashed border-gray-100 space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                <CheckCircleIcon className="h-4 w-4" /> Min. d'achat: {c.minOrderAmount} F
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                <CalendarDaysIcon className="h-4 w-4" /> Expire le: {new Date(c.expirationDate).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-300 uppercase">Utilisé {c.usageCount || 0} fois</span>
              <button className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CRÉATION (Simplifiée) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic mb-8">Nouveau Coupon</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Code (ex: BIENVENUE2024)</label>
                <input 
                  required
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black font-bold uppercase"
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Type</label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold"
                    value={newCoupon.discountType}
                    onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value})}
                  >
                    <option value="PERCENT">Pourcentage (%)</option>
                    <option value="FIXED">Montant Fixe (F)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Valeur</label>
                  <input 
                    type="number" required
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold"
                    value={newCoupon.discountValue}
                    onChange={e => setNewCoupon({...newCoupon, discountValue: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-black uppercase text-xs">Annuler</button>
                <button type="submit" className="flex-1 py-4 bg-black text-white rounded-2xl font-black uppercase text-xs shadow-lg">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}