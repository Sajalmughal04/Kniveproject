import { createSlice } from '@reduxjs/toolkit';

// Helper function to load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem("customer_cart");
    if (saved) {
      const parsedCart = JSON.parse(saved);
      return parsedCart.map((item) => ({
        ...item,
        price: typeof item.price === "string"
          ? parseFloat(item.price.replace("$", "").trim())
          : item.price,
        quantity: item.quantity || 1,
      }));
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return [];
};

// Helper function to save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem("customer_cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

const initialState = {
  items: loadCartFromStorage(),
  toast: "",
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const numericPrice = typeof product.price === "string"
        ? parseFloat(product.price.replace("$", "").trim())
        : product.price;

      const existing = state.items.find((item) => item.id === product.id);
      
      if (existing) {
        existing.quantity += (product.quantity || 1);
        state.toast = "🛒 Quantity updated!";
      } else {
        state.items.push({
          ...product,
          quantity: product.quantity || 1,
          price: numericPrice,
        });
        state.toast = "✅ Item added to cart!";
      }
      
      saveCartToStorage(state.items);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.toast = "❌ Item removed";
      saveCartToStorage(state.items);
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
        saveCartToStorage(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.toast = "🗑️ Cart cleared";
      localStorage.removeItem("customer_cart");
    },

    // ✅ NEW: showToast action for custom messages
    showToast: (state, action) => {
      state.toast = action.payload;
    },

    clearToast: (state) => {
      state.toast = "";
    },
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectToast = (state) => state.cart.toast;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

// ✅ Export showToast with other actions
export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  showToast,  // ✅ Added
  clearToast 
} = cartSlice.actions;

export default cartSlice.reducer;