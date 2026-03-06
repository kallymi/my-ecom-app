import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CalendarDaysIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export default function RevenueChart({ data, onPeriodChange }) {
  const [activePeriod, setActivePeriod] = useState("week");

  const handlePeriodClick = (period) => {
    setActivePeriod(period);
    if (onPeriodChange) onPeriodChange(period);
  };

  return (
    <div className="bg-white p-5 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-black/[0.02] border border-gray-50 w-full transition-all">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="font-[1000] italic uppercase text-[10px] md:text-xs tracking-[0.3em] text-gray-400 mb-2">
            Analyse des revenus
          </h2>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
             <h3 className="text-2xl font-[1000] italic tracking-tighter uppercase">
               Flux <span className="text-indigo-600">Financier.</span>
             </h3>
          </div>
        </div>

        {/* SELECTEUR DE PÉRIODE */}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-full md:w-auto">
          <button
            onClick={() => handlePeriodClick("week")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
              activePeriod === "week" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <CalendarDaysIcon className="h-4 w-4" />
            Semaine
          </button>
          <button
            onClick={() => handlePeriodClick("month")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
              activePeriod === "month" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ChartBarIcon className="h-4 w-4" />
            Mois
          </button>
        </div>
      </div>

      {/* ZONE DU GRAPHIQUE */}
      <div className="h-[250px] md:h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 9, fontWeight: '900', fill: '#cbd5e1'}} 
              dy={15}
            />

            {/* YAXIS MASQUÉ POUR NE PAS AFFICHER LES VALEURS SUR LE CÔTÉ */}
            <YAxis hide={true} />

            <Tooltip 
              cursor={{ stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{
                borderRadius: '20px', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', 
                fontSize: '11px',
                fontWeight: '900',
                padding: '15px'
              }}
              // Ici on affiche quand même la valeur FCFA au survol (Tooltip)
              formatter={(value) => [`${value.toLocaleString()} FCFA`, "Revenu"]}
              itemStyle={{ color: '#4f46e5', textTransform: 'uppercase' }}
            />

            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#4f46e5" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorRev)" 
              // L'ID change pour forcer Recharts à re-calculer l'animation lors du changement de période
              key={activePeriod} 
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER */}
      <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
          Flux synchronisé
        </p>
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
          {activePeriod === 'week' ? '7 derniers jours' : '30 derniers jours'}
        </span>
      </div>
    </div>
  );
}