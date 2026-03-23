import { memo, useMemo } from "react";
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

const OrderRow = memo(function OrderRow({ order, navigate }) {

  const statusStyle = statusMap[order?.status] || "bg-gray-50 text-gray-500";

  return (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => navigate(`/admin/orders/${order._id}`)}
    >
      <td className="px-6 py-4 font-black text-xs uppercase">
        {order?.shippingAddress?.fullName || "Client"}
      </td>

      <td className="px-6 py-4">
        <span
          className={`text-[9px] px-2 py-1 rounded-lg border font-black uppercase ${statusStyle}`}
        >
          {order?.status}
        </span>
      </td>

      <td className="px-6 py-4 text-right font-[1000] text-xs">
        {(order?.totalAmount ?? 0).toLocaleString()} F
      </td>

      <td className="px-4 text-right">
        <ChevronRight size={14} className="text-gray-300" />
      </td>
    </tr>
  );
});


export default function RecentOrders({ orders = [] }) {

  const navigate = useNavigate();

  const latestOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  const hasOrders = latestOrders.length > 0;

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">

      {/* HEADER */}
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">

        <h2 className="font-black uppercase text-[10px] text-gray-400 tracking-widest">
          Commandes
        </h2>

        <button
          onClick={() => navigate("/admin/orders")}
          className="text-[10px] font-black text-indigo-600 uppercase hover:underline"
        >
          Voir tout
        </button>

      </div>

      {/* MOBILE */}
      <div className="block lg:hidden divide-y divide-gray-50">

        {hasOrders ? (

          latestOrders.map((order) => {

            const statusStyle = statusMap[order?.status] || "bg-gray-50 text-gray-500";

            return (
              <div
                key={order._id}
                onClick={() => navigate(`/admin/orders/${order._id}`)}
                className="p-4 flex justify-between items-center active:bg-gray-50 cursor-pointer"
              >

                <div className="min-w-0">

                  <p className="font-mono text-[10px] font-black text-indigo-600">
                    #{order._id?.slice(-6).toUpperCase()}
                  </p>

                  <p className="font-black text-xs text-gray-900 truncate">
                    {order?.shippingAddress?.fullName || "Client"}
                  </p>

                </div>

                <div className="text-right shrink-0">

                  <p className="font-[1000] text-sm">
                    {(order?.totalAmount ?? 0).toLocaleString()} F
                  </p>

                  <span
                    className={`text-[8px] px-2 py-1 rounded-md font-black uppercase ${statusStyle}`}
                  >
                    {order?.status}
                  </span>

                </div>

              </div>
            );

          })

        ) : (

          <p className="text-center text-gray-300 text-[10px] font-black uppercase py-10">
            Aucune commande
          </p>

        )}

      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block">

        <table className="w-full text-left">

          <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Montant</th>
              <th className="px-4"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">

            {hasOrders ? (

              latestOrders.map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  navigate={navigate}
                />
              ))

            ) : (

              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-300 text-xs font-black uppercase">
                  Aucune commande
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}