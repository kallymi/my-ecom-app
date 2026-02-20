import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import OrderCard from './OrderCard';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders');
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (!orders.length) return <div>Aucune commande</div>;

  return (
    <div className="space-y-6">
      {orders.map(order => <OrderCard key={order._id} order={order} />)}
    </div>
  );
};

export default UserOrders;
