import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { cartService } from "../services/cartService";
import { orderService } from "../services/orderService";
// ✅ AJOUT DE L'IMPORT MANQUANT
import { toast } from "react-hot-toast"; 

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const { isAuthenticated, token, initializing, user } = useAuth();

  // ===============================
  // Sync backend
  // ===============================
  useEffect(() => {
    const loadBackendCart = async () => {
      if (!initializing && isAuthenticated && token) {
        setLoading(true);
        try {
          const cartData = await cartService.getCart();

          if ( cartData?.items ) {
           const syncedCart = cartData.items.map(item => ({
              
              product: item.product,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              originalPrice: item.originalPrice,
              discountRate: item.discountRate,
              discountAmount: item.discountAmount,
              isPromoApplied: item.isPromoApplied
            }));
            // CRITIQUE : Au lieu de juste setCart, on s'assure de prendre 
            // la version la plus à jour (backend)
            setCart(syncedCart);
          }
        } catch (err) {
          console.error("Erreur sync backend :", err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadBackendCart();
    // On ajoute initializing, isAuthenticated et token pour ESLint
  }, [isAuthenticated, token, initializing]);

  // ===============================
  // LocalStorage
  // ===============================
  // --- CORRECTION : Sauvegarder TOUJOURS dans le localStorage ---
  useEffect(() => {
    if (!initializing) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, initializing]);
  // ===============================
  // Actions
  // ===============================
  const addToCart = async (product, quantity = 1) => {
    const currentItem = cart.find(i => i.product._id === product._id);
    const currentQuantity = currentItem ? currentItem.quantity : 0;
    const newTotalQuantity = currentQuantity + quantity;

    // 🛡️ VERIFICATION STOCK PRO
    if (product.stock !== undefined && newTotalQuantity > product.stock) {
      toast.error(`Désolé, seulement ${product.stock} unités disponibles.`);
      return; 
    }

    setCart(prev => {
      const exists = prev.find(i => i.product._id === product._id);
      if (exists) {
        return prev.map(i => i.product._id === product._id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product, quantity }];
    });

    if (isAuthenticated && token) {
      try {
        await cartService.addToCart(product._id, quantity, product.finalPrice);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const removeFromCart = async productId => {
    setCart(prev => prev.filter(i => i.product._id !== productId));
    if (isAuthenticated && token) {
      try { await cartService.removeFromCart(productId); } catch (err) { console.error(err); }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    
    // Vérification de stock aussi lors de la mise à jour manuelle (+/-)
    const item = cart.find(i => i.product._id === productId);
    if (item && item.product.stock !== undefined && quantity > item.product.stock) {
        toast.error(`Maximum atteint (${item.product.stock} en stock)`);
        return;
    }

    setCart(prev => prev.map(i => i.product._id === productId ? { ...i, quantity } : i));
    if (isAuthenticated && token) {
      try { await cartService.updateCartItem(productId, quantity); } catch (err) { console.error(err); }
    }
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem("cart");
    if (isAuthenticated && token) {
      try { await cartService.clearCart(); } catch {}
    }
  };

  // ===============================
  // Calculs
  // ===============================
  const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  const cartTotal = cart.reduce((total, item) => {
    const price = item.unitPrice || item.product?.finalPrice || item.product?.price || 0;
    return total + (price * item.quantity);
  }, 0);

  const totalSavings = cart.reduce((total, item) => {
    const currentPrice = item.unitPrice || item.product?.finalPrice || item.product?.price || 0;
    const originalPrice = item.originalPrice || item.product?.price || 0;
    return total + (Math.max(0, originalPrice - currentPrice) * item.quantity);
  }, 0);
  
  // ===============================
  // Checkout complet
  // ===============================
  const checkout = async (shippingInfo, paymentMethod = "COD") => {
    if (cart.length === 0) throw new Error("Le panier est vide");

    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice || item.product?.finalPrice,
        originalPrice: item.originalPrice || item.product?.price,
        discountPerUnit: item.discountAmount || 0,
        name: item.product.name,
        image: item.product.images?.[0]?.url || ""
      }));

      const isGuest = !user;

      const orderData = {
        items: orderItems,
        shippingAddress: {
          fullName: shippingInfo.fullName,
          phone: shippingInfo.phone,
          neighborhood: shippingInfo.neighborhood,
          city: shippingInfo.city || "Non spécifiée",
          address: shippingInfo.address || ""
        },
        paymentMethod,
        totalAmount: cartTotal,
        isGuest,
      };

      const result = await orderService.createOrder(orderData);
      const finalOrder = result.order ? result.order : result;

      await clearCart();
      return { success: true, order: finalOrder };
      
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cart, loading, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, totalItems, totalSavings, checkout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);