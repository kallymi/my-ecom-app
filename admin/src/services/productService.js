import api from "../api/axios";

export const productService = {
  // 1. Voir la corbeille
  getTrash: async () => {
    // Si ton router est monté sur /api/admin
    const res = await api.get("/admin/products/trash"); 
    return res.data;
  },

  // 2. Soft Delete
  softDelete: async (id) => {
    const res = await api.delete(`/admin/products/${id}`);
    return res.data;
  },

  // 3. Restaurer
  restoreProduct: async (id) => {
    const res = await api.patch(`/admin/products/${id}/restore`);
    return res.data;
  },

  // 4. Supprimer définitivement
  deletePermanent: async (id) => {
    const res = await api.delete(`/admin/products/${id}/permanent`);
    return res.data;
  }
};