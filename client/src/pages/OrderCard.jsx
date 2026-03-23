import React from "react";
import { Link } from "react-router-dom";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "./OrderSatatus";
import { getMainImage } from "../utils/getMainImage";

const OrderCard = ({ order }) => {

  const firstItem = order.items?.[0];

  return (
    <div className="
      bg-white rounded-2xl border border-gray-100
      p-4 sm:p-5
      transition-all duration-300
      hover:shadow-lg hover:-translate-y-1
      group
    ">

      <div className="flex items-center justify-between gap-3">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">

          {/* IMAGE */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-xl overflow-hidden border shrink-0">
            {firstItem ? (
              <img 
                src={getMainImage(firstItem.product)}
                alt="produit"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                N/A
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="min-w-0">

            <p className="
              text-[clamp(0.7rem,2vw,0.85rem)]
              font-semibold uppercase
              truncate
            ">
              #{order.orderNumber}
            </p>

            <p className="
              text-gray-400 
              text-[clamp(0.65rem,2vw,0.75rem)]
            ">
              {new Date(order.createdAt).toLocaleDateString('fr-FR')}
            </p>

          </div>
        </div>

        {/* RIGHT */}
        <div className="text-right shrink-0">

          <p className="
            text-[clamp(0.9rem,2.5vw,1.1rem)]
            font-bold text-black
          ">
            {Number(order.totalAmount).toLocaleString()} 
            <span className="text-indigo-600 ml-1 text-sm">F</span>
          </p>

          <div 
            className="
              mt-1 px-3 py-1 rounded-full
              text-[clamp(0.6rem,2vw,0.7rem)]
              font-semibold uppercase text-white
              inline-block
            "
            style={{ backgroundColor: ORDER_STATUS_COLORS[order.status] }}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </div>

        </div>

      </div>

      {/* ACTION */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">

        <Link 
          to={`/order-detail/${order._id}`}
          className="
            text-indigo-600
            text-[clamp(0.7rem,2vw,0.8rem)]
            font-semibold uppercase
            hover:translate-x-1 transition-all duration-300
          "
        >
          Voir détails →
        </Link>

      </div>
    </div>
  );
};

export default OrderCard;