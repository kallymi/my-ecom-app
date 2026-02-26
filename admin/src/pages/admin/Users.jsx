import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  User as UserIcon,
  Loader2,
  Edit3,
  Users as UsersGroup,
  ArrowRight,
  Filter,
  CheckCircle2,
  MoreVertical,
  Mail,
  Fingerprint
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
      u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term) || u._id?.includes(term)
    );
  }, [users, searchTerm]);

  return (
    <div className="p-4 md:p-10 max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <span className="h-[2px] w-8 bg-blue-600"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-600">Directory</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-[1000] tracking-tighter italic uppercase leading-none">
            Membres<span className="text-blue-600">.</span>
          </h1>
        </div>

        {/* Stats - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full xl:w-auto">
          <div className="bg-white border border-gray-100 p-5 rounded-[2rem] flex items-center gap-5 shadow-sm">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <UsersGroup size={20} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Base totale</p>
              <p className="text-2xl font-[1000] italic tracking-tighter">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEARCH & FILTERS --- */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-all" size={20} />
          <input
            type="text"
            placeholder="RECHERCHER..."
            className="w-full pl-16 pr-6 py-5 md:py-7 bg-white border-2 border-gray-50 rounded-[2rem] shadow-lg shadow-blue-900/5 outline-none focus:border-black transition-all font-black text-xs uppercase tracking-widest"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-black text-white px-8 py-5 md:py-0 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all active:scale-95">
          <Filter size={18} />
          <span className="font-black text-[10px] uppercase tracking-[0.2em]">Filtres</span>
        </button>
      </div>

      {/* --- LISTE / TABLEAU RESPONSIVE --- */}
      <div className="bg-white md:rounded-[3rem] rounded-[2rem] shadow-xl border border-gray-50 overflow-hidden">
        {/* Version Desktop (Tableau) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-8 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Utilisateur</th>
                <th className="px-8 py-8 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Accréditation</th>
                <th className="px-8 py-8 text-right text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <UserRow key={user._id} user={user} navigate={navigate} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Version Mobile (Cards) */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredUsers.map((user) => (
            <UserCard key={user._id} user={user} navigate={navigate} />
          ))}
        </div>

        {/* --- EMPTY STATE --- */}
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center opacity-30">
            <Search size={48} className="mx-auto mb-4" />
            <p className="font-black text-[10px] uppercase tracking-widest">Aucun résultat</p>
          </div>
        )}

        {/* --- PAGINATION --- */}
        {page < pages && (
          <div className="p-8 md:p-12 flex justify-center bg-gray-50/30">
            <button
              onClick={() => fetchUsers(page + 1)}
              className="w-full md:w-auto bg-black text-white px-10 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Voir plus <ArrowRight size={16} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* COMPOSANT LIGNE (DESKTOP) */
const UserRow = ({ user, navigate }) => (
  <tr className="group hover:bg-blue-50/20 transition-all">
    <td className="px-8 py-6">
      <div className="flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl italic ${user.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
          {user.name?.charAt(0)}
        </div>
        <div>
          <div className="font-black text-black uppercase text-sm tracking-tight">{user.name}</div>
          <div className="text-[11px] font-bold text-gray-400">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="px-8 py-6">
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
        {user.role === 'admin' ? <ShieldCheck size={12} /> : <UserIcon size={12} />}
        {user.role}
      </span>
    </td>
    <td className="px-8 py-6 text-right">
      <button onClick={() => navigate(`/admin/users/edit/${user._id}`)} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-black hover:text-white transition-all">
        <Edit3 size={18} />
      </button>
    </td>
  </tr>
);

/* COMPOSANT CARD (MOBILE) */
const UserCard = ({ user, navigate }) => (
  <div className="p-6 space-y-4 bg-white active:bg-blue-50/50 transition-colors" onClick={() => navigate(`/admin/users/edit/${user._id}`)}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg italic ${user.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
          {user.name?.charAt(0)}
        </div>
        <div>
          <h4 className="font-black text-black uppercase text-sm tracking-tight">{user.name}</h4>
          <div className="flex items-center gap-1 text-blue-600 font-bold text-[10px] uppercase">
             {user.role === 'admin' ? <ShieldCheck size={10} /> : null}
             {user.role}
          </div>
        </div>
      </div>
      <div className="p-2 bg-gray-50 rounded-lg"><MoreVertical size={16} className="text-gray-300" /></div>
    </div>
    
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        <Mail size={12} className="shrink-0" /> {user.email}
      </div>
      <div className="flex items-center gap-3 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
        <Fingerprint size={12} className="shrink-0" /> ID: {user._id.slice(-8).toUpperCase()}
      </div>
    </div>

    <button className="w-full py-4 bg-gray-50 border border-gray-100 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
      <Edit3 size={14} /> Configurer le profil
    </button>
  </div>
);