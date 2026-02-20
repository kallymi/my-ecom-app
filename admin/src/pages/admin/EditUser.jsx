import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Trash2, ArrowLeft, Shield, User, Lock, Unlock, Loader2, AlertCircle } from "lucide-react";
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
      const { data } = await api.put(`/admin/users/${id}`, {
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked
      });
      if (data.success) {
        alert("Modifications enregistrées avec succès.");
        navigate("/admin/users");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Erreur de mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("❗ Action irréversible : Supprimer définitivement ce compte ?")) {
      try {
        const { data } = await api.delete(`/admin/users/${id}`);
        if (data.success) {
          navigate("/admin/users");
        }
      } catch (err) {
        alert(err.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;

    // PROTECTION ANTI-CRASH : Si l'API a renvoyé null (404)
    if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-red-500 font-bold text-xl">Utilisateur introuvable ou erreur de serveur.</p>
        <button onClick={() => navigate("/admin/users")} className="px-6 py-2 bg-gray-900 text-white rounded-xl">
        Retour à la liste
        </button>
    </div>
    );
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-3xl mx-auto">
        {/* Barre de retour */}
        <button 
          onClick={() => navigate("/admin/users")} 
          className="group flex items-center text-gray-400 hover:text-indigo-600 transition-colors mb-8 font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour à l'annuaire
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne Gauche : Infos Sommaires */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="w-24 h-24 rounded-3xl bg-indigo-600 mx-auto mb-4 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-200">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500 break-all">{user.email}</p>
            </div>

            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 p-4 text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all font-bold text-sm"
            >
              <Trash2 size={18} />
              Supprimer le compte
            </button>
          </div>

          {/* Colonne Droite : Formulaire */}
          <div className="lg:col-span-2">
            <form onSubmit={handleUpdate} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 space-y-8">
                
                {/* Section Rôle */}
                <section>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Privilèges Système</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUser({ ...user, role: "customer" })}
                      className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                        user.role === "customer" ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-gray-100 text-gray-400 opacity-60"
                      }`}
                    >
                      <User size={24} />
                      <span className="font-bold">Client</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUser({ ...user, role: "admin" })}
                      className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                        user.role === "admin" ? "border-purple-600 bg-purple-50 text-purple-700" : "border-gray-100 text-gray-400 opacity-60"
                      }`}
                    >
                      <Shield size={24} />
                      <span className="font-bold">Admin</span>
                    </button>
                  </div>
                </section>

                {/* Section Sécurité/Blocage */}
                <section>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Statut de sécurité</h3>
                  <div 
                    onClick={() => setUser({ ...user, isBlocked: !user.isBlocked })}
                    className={`cursor-pointer flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                      user.isBlocked ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${user.isBlocked ? "bg-red-200" : "bg-emerald-200"}`}>
                        {user.isBlocked ? <Lock size={20} /> : <Unlock size={20} />}
                      </div>
                      <div>
                        <p className="font-bold">{user.isBlocked ? "Accès révoqué" : "Accès autorisé"}</p>
                        <p className="text-xs opacity-80">{user.isBlocked ? "L'utilisateur ne peut plus se connecter" : "L'utilisateur peut naviguer librement"}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${user.isBlocked ? "bg-red-500" : "bg-emerald-500"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.isBlocked ? "right-1" : "left-1"}`}></div>
                    </div>
                  </div>
                </section>

                {/* Info Note */}
                <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-sm">
                  <AlertCircle size={20} className="shrink-0" />
                  <p>La modification du rôle prendra effet à la prochaine reconnexion de l'utilisateur.</p>
                </div>
              </div>

              {/* Footer Formulaire */}
              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
                >
                  {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}