import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState("");
  const isInitialMount = useRef(true); // ✅ Track first render

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("customer_cart")) || [];
    const numericCart = saved.map((item) => ({
      ...item,
      price:
        typeof item.price === "string"
          ? parseFloat(item.price.replace("$", "").trim())
          : item.price,
      quantity: item.quantity || 1,
    }));
    setCart(numericCart);
  }, []);

  useEffect(() => {
    // ✅ Skip saving on initial mount - sirf updates pe save karo
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem("customer_cart", JSON.stringify(cart));
  }, [cart]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const addToCart = (product) => {
    const numericPrice =
      typeof product.price === "string"
        ? parseFloat(product.price.replace("$", "").trim())
        : product.price;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        showToast("🛒 Quantity updated!");
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        showToast("✅ Item added to cart!");
        return [
          ...prev,
          { ...product, quantity: product.quantity || 1, price: numericPrice },
        ];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast("❌ Item removed");
  };

  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("customer_cart");
    showToast("🗑️ Cart cleared");
  };

  const getTotal = () =>
    cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const getCartTotal = () => getTotal();

  const getCartCount = () =>
    cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-xl shadow-lg z-50 text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);