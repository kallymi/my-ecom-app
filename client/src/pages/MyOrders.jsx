import React, { useEffect, useState } from "react";
import axios from "axios";
import OrderCard from "../components/orders/OrderCard";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Erreur récupération commandes :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Cette fonction permet de rafraîchir les données sans recharger la page
  const handleOrderUpdate = () => {
    fetchOrders();
  };

  if (loading) return <div className="py-20 text-center">Chargement...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-8">
      <h1 className="text-4xl font-black uppercase tracking-tight italic">Mes commandes</h1>

      {orders.length === 0 ? (
        <p className="text-gray-400">Aucune commande trouvée.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard 
              key={order._id} 
              order={order} 
              onRefresh={handleOrderUpdate} // <--- On passe la fonction ici
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
