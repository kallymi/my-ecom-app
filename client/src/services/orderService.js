import api from '../api/axios'; // On importe l'instance configurée plus haut

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders/my-orders', { params });
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId, reason) => {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  downloadInvoice: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facture-${orderId}.html`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  getOrderStats: async () => {
    const response = await api.get('/orders/stats/count');
    return response.data;
  },

  updateOrderStatus: async (orderId, statusData) => {
    const response = await api.put(`/orders/${orderId}`, statusData);
    return response.data;
  },

  requestReturn: async (orderId) => {
    const response = await api.put(`/orders/${orderId}/request-return`);
    return response.data;
  },

  confirmReturn: async (orderId) => {
    const response = await api.put(`/orders/${orderId}/confirm-return`);
    return response.data;
  },

};