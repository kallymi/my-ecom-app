import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color }) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
      {/* Background Decor */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 ${color}`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${color.replace('bg-', 'bg-opacity-10 text-')}`}>
            <Icon size={24} strokeWidth={1.5} />
          </div>
          {trend && (
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
          {title}
        </h3>
        <p className="text-2xl font-[1000] text-slate-900 tracking-tighter italic">
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatCard;