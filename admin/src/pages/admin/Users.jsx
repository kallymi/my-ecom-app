import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  User as UserIcon,
  Loader2,
  Edit3,
  Users as UsersGroup,
  UserPlus,
  ArrowRight
} from "lucide-react";
import api from "../../api/axios";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchUsers = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?page=${pageNumber}&limit=10`);
      setUsers((prev) => (pageNumber === 1 ? data.users : [...prev, ...data.users]));
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      console.error("Erreur chargement utilisateurs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(1); }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter((u) => 
      u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <div className="absolute inset-0 scale-150 blur-xl bg-blue-500/20 rounded-full"></div>
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-gray-400">Synchronisation des données...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-12 bg-blue-600 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Admin Panel</span>
          </div>
          <h1 className="text-5xl font-[900] tracking-tighter italic text-black uppercase">
            Utilisateurs<span className="text-blue-600">.</span>
          </h1>
          <p className="text-gray-400 font-medium text-sm max-w-md">
            Gérez les privilèges d'accès, surveillez les comptes clients et modérez les rôles administratifs.
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/40 flex items-center gap-5">
            <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black shadow-inner">
              <UsersGroup size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Membres</p>
              <p className="text-2xl font-black italic tracking-tighter">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="text-gray-300 group-focus-within:text-blue-600 transition-colors" size={20} />
        </div>
        <input
          type="text"
          placeholder="RECHERCHER UN NOM, UN EMAIL, UN ID..."
          className="w-full pl-16 pr-8 py-6 bg-white border-2 border-gray-50 rounded-[2.5rem] shadow-xl shadow-gray-100/50 outline-none focus:border-black transition-all font-bold text-sm placeholder:text-gray-300 placeholder:font-black placeholder:tracking-widest"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- USERS TABLE --- */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/60 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Membre</th>
                <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut / Rôle</th>
                <th className="px-10 py-8 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Gestion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="group hover:bg-gray-50/80 transition-all">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-black text-xl italic shadow-lg group-hover:bg-blue-600 transition-colors">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          {user.role === 'admin' && (
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-lg shadow-lg border-2 border-white">
                              <ShieldCheck size={12} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-[900] text-black uppercase text-sm tracking-tight group-hover:text-blue-600 transition-colors">
                            {user.name}
                          </div>
                          <div className="text-xs font-bold text-gray-400 lowercase">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-10 py-6">
                      <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        user.role === "admin" 
                        ? "bg-black text-white shadow-lg shadow-black/10" 
                        : "bg-blue-50 text-blue-600"
                      }`}>
                        {user.role === "admin" ? <ShieldCheck size={14} /> : <UserIcon size={14} />}
                        {user.role === "admin" ? "Administrator" : "Client Premium"}
                      </span>
                    </td>

                    <td className="px-10 py-6 text-right">
                      <button
                        onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                        className="inline-flex items-center gap-3 bg-gray-100 text-gray-400 px-6 py-3 rounded-2xl hover:bg-black hover:text-white transition-all font-black text-[10px] uppercase tracking-widest active:scale-95"
                      >
                        <Edit3 size={14} />
                        Modifier
                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-24">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                        <Search size={32} />
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-300 italic">Aucun profil ne correspond</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- LOAD MORE --- */}
        {page < pages && (
          <div className="p-10 flex justify-center bg-gray-50/30">
            <button
              onClick={() => fetchUsers(page + 1)}
              disabled={loading}
              className="group relative flex items-center gap-4 bg-white border-2 border-black px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all disabled:opacity-30 shadow-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  Découvrir plus de profils
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}