import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid, 
  ReferenceArea,
} from "recharts";
import { CalendarDaysIcon, ChartBarIcon } from "@heroicons/react/24/outline";

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
        <p className="font-bold text-gray-800 mb-3 text-sm capitalize">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: entry.color }} 
                />
                <span className="text-xs font-medium text-gray-500">
                  {entry.dataKey === "caValide" ? "CA Validé" : "En Attente"}
                </span>
              </div>
              <span className="text-sm font-black text-gray-900">
                {Number(entry.value).toLocaleString('fr-FR')} <span className="text-xs text-gray-400 font-normal">FCFA</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const RevenueChart = React.memo(function RevenueChart({
  data,
  onPeriodChange,
  loading = false,
}) {
  const [activePeriod, setActivePeriod] = useState("week");

  const handlePeriodClick = (period) => {
    setActivePeriod(period);
    if (onPeriodChange) onPeriodChange(period);
  };

  const formattedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item) => ({
      name: item.name,
      caValide: Number(item.caValide || 0),
      enAttente: Number(item.enAttente || 0),
    }));
  }, [data]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 w-full flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h2 className="text-xs tracking-widest text-gray-400 mb-1 uppercase font-semibold">
            Analyse des revenus
          </h2>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
            Flux <span className="text-indigo-600">Financier</span>
          </h3>
          
          {/* LÉGENDE INTÉGRÉE */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-gray-500 font-medium">CA Validé</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-xs text-gray-500 font-medium">En Attente</span>
            </div>
          </div>
        </div>

        {/* SELECTEUR */}
        <div className="flex bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100">
          <button
            onClick={() => handlePeriodClick("week")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
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
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
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

      {/* GRAPH */}
      <div className="h-[320px] w-full flex-grow">
        {loading ? (
          <div className="flex items-end justify-between gap-3 h-full pb-6">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-gray-50 rounded-t-xl animate-pulse"
                style={{ height: `${Math.random() * 60 + 20}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : formattedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <ChartBarIcon className="h-10 w-10 text-gray-200" />
            <span className="text-sm font-medium">Aucune donnée disponible</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={formattedData} 
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="valide" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="attente" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Grille allégée (uniquement lignes horizontales) */}
              <CartesianGrid 
                vertical={false} 
                stroke="#f3f4f6" 
                strokeDasharray="4 4" 
              />

              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                tickFormatter={(value) => value > 0 ? `${(value / 1000).toFixed(0)}k` : '0'}
                dx={-10}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }} />

              {formattedData.length > 7 && (
                <ReferenceArea 
                  x1={formattedData[formattedData.length - 7].name} // 7 jours en arrière (ajuste selon ton returnDelay)
                  x2={formattedData[formattedData.length - 1].name} // Aujourd'hui
                  fill="#f3f4f6" 
                  fillOpacity={0.5} 
                />
              )}

              {/* L'ordre est important : la courbe affichée derrière doit être en premier */}
              <Area
                type="monotone"
                dataKey="enAttente"
                stroke="#f59e0b"
                fill="url(#attente)"
                strokeWidth={3}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#f59e0b' }}
              />

              <Area
                type="monotone"
                dataKey="caValide"
                stroke="#10b981"
                fill="url(#valide)"
                strokeWidth={3}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
        <span className="text-xs text-gray-400 font-medium">Mise à jour en temps réel</span>
        <div className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">
          {activePeriod === "week" ? "7 derniers jours" : "30 derniers jours"}
        </div>
      </div>
    </div>
  );
});

export default RevenueChart;