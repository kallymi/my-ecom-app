// src/components/orders/OrderRow.jsx
import { MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";

export const OrderRow = ({ order, onSelect, statusColors, statusLabels }) => {
  // Sécurité pour récupérer les articles
  const items = order.items || [];
  const previewItems = items.slice(0, 3); // On prend les 3 premiers

  // Fonction pour obtenir l'image, peu importe la structure de l'API
  const getProductImage = (item) => {
    if (item.product?.images && item.product.images.length > 0) {
      // Cas 1 : C'est un tableau d'objets avec une propriété url
      if (item.product.images[0].url) return item.product.images[0].url;
      // Cas 2 : C'est un tableau de chaînes de caractères (strings)
      if (typeof item.product.images[0] === 'string') return item.product.images[0];
    }
    if (item.image) return item.image; // Cas 3 : Image directement sur l'item
    return "https://via.placeholder.com/150?text=CHEEL"; // Fallback chic
  };

  return (
    <tr className="flex flex-col md:table-row p-5 md:p-0 hover:bg-slate-50/50 transition-all border-b border-gray-100 last:border-none duration-300">
      
      {/* PRODUITS & ID : Style Stacked Images */}
      <td className="md:p-8 py-3">
        <div className="flex items-center gap-5">
          {/* Stack d'images style Luxe */}
          <div className="flex -space-x-4 overflow-hidden shrink-0">
            {previewItems.map((item, idx) => (
              <div key={idx} className="relative inline-block h-14 w-14 rounded-full ring-4 ring-white bg-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 transition-transform hover:scale-110 hover:z-10">
                <img 
                  src={getProductImage(item)} 
                  alt={item.product?.name || "produit"} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Err";
                  }}
                />
              </div>
            ))}
            {items.length > 3 && (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-[10px] font-[1000] text-white ring-4 ring-white tracking-tighter shadow-xl">
                +{items.length - 3}
              </div>
            )}
            {items.length === 0 && (
                <div className="h-14 w-14 rounded-full bg-slate-100 animate-pulse border border-gray-100"/>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-[1000] text-gray-300 uppercase tracking-[0.2em] leading-none mb-1.5 italic">
              {order.orderNumber || order._id?.slice(-6).toUpperCase()}
            </p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter italic truncate max-w-[150px]">
                {items.length} article{items.length > 1 ? 's' : ''} • {items[0]?.product?.name || "Chargement..."}
            </p>
          </div>
        </div>
      </td>

      {/* DESTINATAIRE */}
      <td className="md:p-8 py-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 font-[1000] text-sm uppercase tracking-tight italic text-black leading-none">
            {order.shippingAddress?.fullName || "Client Inconnu"}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 italic">
            <PhoneIcon className="h-3 w-3 stroke-[2.5]" /> {order.shippingAddress?.phone || "-- -- --"}
          </div>
        </div>
      </td>

      {/* ZONE (QUARTIER) */}
      <td className="md:p-8 py-3">
        <div className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform duration-300">
            <MapPinIcon className="h-4 w-4 stroke-[2]" />
          </div>
          <span className="text-[10px] font-bold">
            {order.shippingAddress?.neighborhood || "N'Djamena"}
          </span>
        </div>
      </td>

      {/* MONTANT */}
      <td className="md:p-8 py-3">
        <div className="flex flex-col items-start md:items-end">
          <span className="font-[1000] text-2xl md:text-xl tracking-tighter text-black leading-none">
            {order.totalAmount?.toLocaleString('fr-FR')}
            <span className="text-[11px] ml-1.5 text-slate-400 font-black not-italic uppercase tracking-normal">FCFA</span>
          </span>
          <span className="text-[9px] font-black text-emerald-600 uppercase italic tracking-widest mt-1.5 bg-emerald-50 px-2 py-0.5 rounded-md">Cash</span>
        </div>
      </td>

      {/* ÉTAT */}
      <td className="md:p-8 py-3">
        <span className={`inline-flex px-4 py-2 rounded-2xl text-[9px] font-[1000] uppercase border tracking-[0.2em] shadow-inner ${statusColors[order.status]}`}>
          {statusLabels[order.status]}
        </span>
      </td>

      {/* ACTION */}
      <td className="md:p-8 py-4 text-left md:text-right">
        <button
          onClick={() => onSelect(order)}
          className="w-full md:w-auto bg-black text-white px-7 py-4 md:py-3.5 rounded-full text-[10px] font-[1000] uppercase tracking-[0.2em] hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 active:scale-95 italic shadow-lg shadow-black/10"
        >
          Gérer
        </button>
      </td>
    </tr>
  );
};