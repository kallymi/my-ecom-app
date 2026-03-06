import React from 'react';
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const statusMap = {
  PENDING: "bg-amber-50 text-amber-600 border-amber-100",
  CONFIRMED: "bg-indigo-50 text-indigo-600 border-indigo-100",
  SHIPPING: "bg-blue-50 text-blue-600 border-blue-100",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-600 border-red-100",
  RETURNED: "bg-gray-100 text-gray-600 border-gray-200",
  RETURN_REQUESTED: "bg-orange-50 text-orange-600 border-orange-100 animate-pulse",
};

export default function RecentOrders({ orders }) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h2 className="font-black uppercase text-[10px] text-gray-400 tracking-widest">Commandes</h2>
        <button onClick={() => navigate('/admin/orders')} className="text-[10px] font-black text-indigo-600 uppercase">Voir tout</button>
      </div>

      {/* MOBILE : Liste de cartes simples */}
      <div className="block lg:hidden divide-y divide-gray-50">
        {orders?.map((order) => (
          <div key={order._id} className="p-4 flex justify-between items-center active:bg-gray-50">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-black text-indigo-600">#{order._id.slice(-6).toUpperCase()}</p>
              <p className="font-black text-xs text-gray-900 truncate">{order.shippingAddress?.fullName}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-[1000] text-sm">{order.totalAmount?.toLocaleString()} F</p>
              <span className="text-[8px] font-black uppercase text-emerald-500">{order.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP : Vrai tableau */}
      <div className="hidden lg:block">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders?.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/admin/orders')}>
                <td className="px-6 py-4 font-black text-xs uppercase">{order.shippingAddress?.fullName}</td>
                <td className="px-6 py-4 text-[10px] font-black text-indigo-600">{order.status}</td>
                <td className="px-6 py-4 text-right font-[1000] text-xs">{order.totalAmount?.toLocaleString()} F</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}