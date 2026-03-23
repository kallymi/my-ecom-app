/* ============================
   LABELS DES STATUTS (BACKEND)
============================ */

export const ORDER_STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPING: "En cours de livraison",
  DELIVERED: "Livrée",
  RETURN_REQUESTED: "Retour demandé",
  RETURNED: "Retournée",
  CANCELLED: "Annulée",
  RETURN_REJECTED: "Retour refusé",
};

/* ============================
   COULEURS DES STATUTS
============================ */

export const ORDER_STATUS_COLORS = {
  PENDING: "#f59e0b",           // amber
  CONFIRMED: "#3b82f6",         // blue
  SHIPPING: "#0ea5e9",          // sky
  DELIVERED: "#10b981",         // green
  RETURN_REQUESTED: "#f97316",  // orange
  RETURNED: "#6b7280",          // gray
  CANCELLED: "#ef4444",         // red
  RETURN_REJECTED: "#64748b", // Ardoise/Gris foncé
};
