import React from 'react';

export const CheckoutInput = ({ label, icon, placeholder, value, onChange }) => (
  <div className="space-y-1.5 md:space-y-2">
    <label className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-black/30 ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-indigo-600 transition-colors">
        {icon}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl py-3.5 md:py-5 pl-12 pr-4 text-xs md:text-sm font-bold focus:ring-2 focus:ring-indigo-600/20 transition-all placeholder:text-black/10"
      />
    </div>
  </div>
);