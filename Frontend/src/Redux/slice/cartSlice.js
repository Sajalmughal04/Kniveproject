import { createSlice } from '@reduxjs/toolkit';
import { logout } from './authSlice'; // ✅ Import logout to clear cart on logout

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

      // Parse discount fields
      const discountType = product.discountType || 'none';
      const discountValue = product.discountValue || 0;
      const hasDiscount = product.hasDiscount || (discountValue > 0 && discountType !== 'none');

      // Calculate final price if not provided
      let finalPrice = product.finalPrice || numericPrice;
      if (typeof finalPrice === "string") {
        finalPrice = parseFloat(finalPrice.replace("$", "").trim());
      }

      // Calculate savings
      const savings = product.savings || (hasDiscount ? numericPrice - finalPrice : 0);

      const existing = state.items.find((item) => item.id === product.id);

      if (existing) {
        existing.quantity += (product.quantity || 1);
        state.toast = "🛒 Quantity updated!";
      } else {
        state.items.push({
          ...product,
          quantity: product.quantity || 1,
          price: numericPrice,
          discountType,
          discountValue,
          finalPrice,
          hasDiscount,
          savings,
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

    showToast: (state, action) => {
      state.toast = action.payload;
    },

    clearToast: (state) => {
      state.toast = "";
    },
  },

  // ✅ Listen to logout action from authSlice
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.items = [];
      state.toast = "";
      console.log('🛒 Cart cleared on logout');
    });
  },
});

// ========================================
// ✅ SELECTORS - ALL EXPORTED
// ========================================

// Get all cart items
export const selectCartItems = (state) => state.cart.items;

// Get toast message
export const selectToast = (state) => state.cart.toast;

// Get total cart value
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => {
    const itemPrice = item.finalPrice || item.price;
    return sum + item.quantity * itemPrice;
  }, 0);

// Get total item count
export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

// Get total savings
export const selectCartSavings = (state) =>
  state.cart.items.reduce((sum, item) => {
    const savings = item.savings || 0;
    return sum + item.quantity * savings;
  }, 0);

// Check if cart is empty
export const selectIsCartEmpty = (state) => state.cart.items.length === 0;

// Get cart item by ID
export const selectCartItemById = (id) => (state) =>
  state.cart.items.find((item) => item.id === id);

// ========================================
// ✅ ACTIONS - ALL EXPORTED
// ========================================

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  showToast,
  clearToast
} = cartSlice.actions;

export default cartSlice.reducer;