
export const StatCard = ({ label, value, type }) => {
  const colors = {
    total: "text-black",
    pending: "text-orange-500",
    delivered: "text-emerald-500",
  };

  return (
    <div className="bg-white border border-gray-100 p-6 rounded-[2rem] min-w-[80px] flex-1 snap-center shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-[1000] italic tracking-tighter ${colors[type]}`}>
        {value.toString().padStart(2, '0')}
      </p>
    </div>
  );
};