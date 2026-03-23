import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Save, Trash2, ArrowLeft, Shield, User, 
  Lock, Unlock, Loader2, AlertCircle, Fingerprint, Mail 
} from "lucide-react";
import api from "../../api/axios";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/admin/users/${id}`);
        setUser(data.user);
      } catch (err) {
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // On envoie l'objet user complet pour éviter les manques au backend
      await api.put(`/admin/users/${id}`, {
        name: user.name,
        email: user.email.toLowerCase(), // Respect de ta consigne : email en minuscules
        role: user.role,
        isBlocked: user.isBlocked
      });
      
      // Optionnel : un petit toast de succès ici serait top
      navigate("/admin/users");
    } catch (err) {
      console.error("Erreur PUT:", err.response?.data);
      alert(err.response?.data?.message || "Erreur de mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("❗ ACTION IRREVERSIBLE : Supprimer définitivement ce compte et toutes ses données associées ?")) {
      try {
        await api.delete(`/admin/users/${id}`);
        navigate("/admin/users");
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Accès au registre...</p>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 md:p-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER DE NAVIGATION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <button 
          onClick={() => navigate("/admin/users")} 
          className="group flex items-center text-gray-400 hover:text-black transition-colors font-black uppercase text-[10px] tracking-[0.2em]"
        >
          <ArrowLeft size={18} className="mr-3 group-hover:-translate-x-2 transition-transform" strokeWidth={3} />
          Retour à l'annuaire
        </button>

        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
          <Fingerprint size={16} className="text-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">UUID: {id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLONNE GAUCHE : PROFILE CARD */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            
            <div className="w-28 h-28 rounded-[2.5rem] bg-black mx-auto mb-6 flex items-center justify-center text-white text-4xl font-[1000] italic shadow-2xl group-hover:scale-105 transition-transform duration-500">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            
            <h2 className="text-2xl font-[1000] text-black uppercase italic tracking-tighter mb-2">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
              <Mail size={14} />
              <p className="text-xs font-bold lowercase">{user.email}</p>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
              {user.role}
            </div>
          </div>

          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-3 p-5 text-red-500 bg-white border-2 border-red-50 hover:bg-red-500 hover:text-white rounded-[2rem] transition-all font-black text-[10px] uppercase tracking-widest group"
          >
            <Trash2 size={18} className="group-hover:animate-bounce" />
            Supprimer le compte
          </button>
        </div>

        {/* COLONNE DROITE : CONTROLES */}
        <div className="lg:col-span-8">
          <form onSubmit={handleUpdate} className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/60 border border-gray-50 overflow-hidden">
            <div className="p-8 md:p-12 space-y-12">
              
              {/* SECTION ROLE */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                   <div className="h-px flex-1 bg-gray-100"></div>
                   <h3 className="text-[10px] font-[1000] text-gray-300 uppercase tracking-[0.3em]">Accréditation</h3>
                   <div className="h-px flex-1 bg-gray-100"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RoleButton 
                    active={user.role === "user"}
                    onClick={() => setUser({ ...user, role: "user" })}
                    icon={<User size={24} />}
                    label="Client"
                    description="Accès standard à la boutique"
                    color="blue"
                  />
                  <RoleButton 
                    active={user.role === "admin"}
                    onClick={() => setUser({ ...user, role: "admin" })}
                    icon={<Shield size={24} />}
                    label="Admin"
                    description="Accès total au dashboard"
                    color="purple"
                  />
                </div>
              </section>

              {/* SECTION SÉCURITÉ */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                   <div className="h-px flex-1 bg-gray-100"></div>
                   <h3 className="text-[10px] font-[1000] text-gray-300 uppercase tracking-[0.3em]">Pare-feu de connexion</h3>
                   <div className="h-px flex-1 bg-gray-100"></div>
                </div>

                <div 
                  onClick={() => setUser({ ...user, isBlocked: !user.isBlocked })}
                  className={`cursor-pointer group flex items-center justify-between p-8 rounded-[2.5rem] border-2 transition-all duration-500 ${
                    user.isBlocked 
                    ? "border-red-500 bg-red-50/50 shadow-lg shadow-red-200/50" 
                    : "border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-200/50"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${user.isBlocked ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
                      {user.isBlocked ? <Lock size={24} /> : <Unlock size={24} />}
                    </div>
                    <div>
                      <p className={`text-sm font-black uppercase tracking-widest ${user.isBlocked ? "text-red-600" : "text-emerald-600"}`}>
                        {user.isBlocked ? "Utilisateur banni" : "Compte actif"}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
                        {user.isBlocked ? "Toute tentative d'accès est rejetée" : "Navigation et achats autorisés"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Custom Toggle Switch */}
                  <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-500 ${user.isBlocked ? "bg-red-500" : "bg-emerald-500"}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-500 transform ${user.isBlocked ? "translate-x-6" : "translate-x-0"}`}></div>
                  </div>
                </div>
              </section>

              {/* WARNING NOTE */}
              <div className="flex gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 italic">
                <AlertCircle size={20} className="shrink-0 text-blue-600" />
                <p className="text-[11px] font-bold text-gray-500 leading-relaxed uppercase tracking-tight">
                  Note : Les changements de privilèges sont instantanés. Si vous bannissez un utilisateur, sa session sera invalidée immédiatement.
                </p>
              </div>
            </div>

            {/* FORM FOOTER */}
            <div className="p-10 bg-black flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">Vérifiez vos modifications avant validation</p>
              <button
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto flex items-center justify-center gap-4 px-12 py-5 bg-blue-600 text-white rounded-[1.5rem] font-[1000] text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 hover:bg-white hover:text-black hover:scale-105 transition-all disabled:opacity-50"
              >
                {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} strokeWidth={3} />}
                Déployer les mises à jour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les boutons de rôle
function RoleButton({ active, onClick, icon, label, description, color }) {
  const activeStyles = {
    blue: "border-blue-600 bg-blue-50 text-blue-700 shadow-xl shadow-blue-100",
    purple: "border-purple-600 bg-purple-50 text-purple-700 shadow-xl shadow-purple-100"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center text-center gap-3 p-8 rounded-[2.5rem] border-2 transition-all duration-500 group ${
        active ? activeStyles[color] : "border-gray-50 bg-white text-gray-300 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:border-gray-200"
      }`}
    >
      <div className={`p-4 rounded-2xl transition-all duration-500 ${active ? 'scale-110 shadow-lg shadow-current/20' : ''}`}>
        {icon}
      </div>
      <div>
        <p className="font-[1000] uppercase text-sm tracking-tighter mb-1">{label}</p>
        <p className="text-[9px] font-bold uppercase opacity-60 tracking-widest">{description}</p>
      </div>
    </button>
  );
}