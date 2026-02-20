import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { cartService } from "../services/cartService";
import { orderService } from "../services/orderService";

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

          if (
            cartData?.items &&
            cartData.items.every(item => item.product && typeof item.product === "object")
          ) {
            setCart(
              cartData.items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                originalPrice: item.originalPrice,
                discountRate: item.discountRate,
                discountAmount: item.discountAmount,
                isPromoApplied: item.isPromoApplied
              }))
            );
          }
        } catch (err) {
          console.error("Erreur sync backend :", err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadBackendCart();
  }, [isAuthenticated, token, initializing]);

  // ===============================
  // LocalStorage
  // ===============================
  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isAuthenticated, initializing]);

  // ===============================
  // Actions
  // ===============================
  const addToCart = async (product, quantity = 1) => {
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
    // On cherche le prix unitaire gelé OU le prix promo du produit
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
        shippingAddress: shippingInfo,
        paymentMethod,
        totalAmount: cartTotal,
        isGuest,
        guestInfo: isGuest ? shippingInfo : undefined
      };

      // 1. Appel au service (qui renvoie response.data)
      const result = await orderService.createOrder(orderData);

      // 2. Extraction intelligente : on prend l'objet 'order' s'il existe, 
      // sinon on prend le résultat entier.
      const finalOrder = result.order ? result.order : result;

      // 3. Vider le panier
      await clearCart();

      // On renvoie l'objet 'order' directement déballé
      return { success: true, order: finalOrder };
      
    } catch (err) {
      console.error("Erreur lors du checkout :", err);
      return { 
        success: false, 
        message: err.response?.data?.message || err.message 
      };
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
