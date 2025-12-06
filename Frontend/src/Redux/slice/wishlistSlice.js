import { createSlice } from '@reduxjs/toolkit';
import { logout } from './authSlice';

// Helper function to load wishlist from localStorage
const loadWishlistFromStorage = () => {
    try {
        const saved = localStorage.getItem("wishlist");
        if (saved) {
            const parsed = JSON.parse(saved);
            console.log("📦 Initial wishlist loaded:", parsed.length, "items");
            return parsed;
        }
    } catch (error) {
        console.error("❌ Error loading wishlist from localStorage:", error);
    }
    return [];
};

// Helper function to save wishlist to localStorage
const saveWishlistToStorage = (wishlist) => {
    try {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        console.log("💾 Wishlist saved:", wishlist.length, "items");
    } catch (error) {
        console.error("❌ Error saving wishlist to localStorage:", error);
    }
};

const initialState = {
    items: loadWishlistFromStorage(),
    toast: "",
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        // Toggle item in wishlist (add or remove)
        toggleWishlist: (state, action) => {
            const product = action.payload;

            // Extract ID with multiple fallbacks
            const productId = product?.id || product?._id;

            if (!productId) {
                console.error("❌ No valid ID found in product:", product);
                state.toast = "Cannot update wishlist - Invalid product data";
                return;
            }

            console.log("✅ Product ID found:", productId);

            // Check if product exists
            const existingIndex = state.items.findIndex(item => {
                const itemId = item.id || item._id;
                return itemId === productId;
            });

            if (existingIndex !== -1) {
                // Remove from wishlist
                console.log("🗑️ Removing product from wishlist:", productId);
                state.items.splice(existingIndex, 1);
                state.toast = `${product.name || product.title || "Product"} removed from wishlist`;
            } else {
                // Add to wishlist with complete data
                console.log("➕ Adding product to wishlist:", productId);

                const newItem = {
                    id: productId,
                    _id: productId,
                    name: product.name || product.title || "Unknown Product",
                    title: product.title || product.name || "Unknown Product",
                    price: typeof product.price === 'number' ? product.price : 0,
                    image: product.image ||
                        (product.images && product.images.length > 0 ? product.images[0].url : null) ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E",
                    oldPrice: product.oldPrice || null,
                    category: product.category || "Uncategorized",
                    stock: typeof product.stock === 'number' ? product.stock : 0,
                    description: product.description || "No description available",
                    hasDiscount: product.hasDiscount || false,
                    discountType: product.discountType || null,
                    discountValue: product.discountValue || 0,
                    originalPrice: product.originalPrice || product.price
                };

                console.log("📝 New wishlist item:", newItem);
                state.items.push(newItem);
                state.toast = `${newItem.name} added to wishlist!`;
            }

            saveWishlistToStorage(state.items);
        },

        // Remove specific item from wishlist
        removeFromWishlist: (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter(item => {
                const itemId = item.id || item._id;
                return itemId !== productId;
            });
            state.toast = "Item removed from wishlist";
            saveWishlistToStorage(state.items);
        },

        // Clear entire wishlist
        clearWishlist: (state) => {
            console.log("🗑️ Clearing entire wishlist");
            state.items = [];
            state.toast = "Wishlist cleared";
            localStorage.removeItem("wishlist");
        },

        // Show toast message
        showWishlistToast: (state, action) => {
            state.toast = action.payload;
        },

        // Clear toast message
        clearWishlistToast: (state) => {
            state.toast = "";
        },
    },

    // Listen to logout action from authSlice
    extraReducers: (builder) => {
        builder.addCase(logout, (state) => {
            state.items = [];
            state.toast = "";
            localStorage.removeItem("wishlist");
            console.log('❤️ Wishlist cleared on logout');
        });
    },
});

// ========================================
// SELECTORS
// ========================================

// Get all wishlist items
export const selectWishlistItems = (state) => state.wishlist.items;

// Get wishlist count
export const selectWishlistCount = (state) => state.wishlist.items.length;

// Get toast message
export const selectWishlistToast = (state) => state.wishlist.toast;

// Check if product is in wishlist
export const selectIsInWishlist = (productId) => (state) => {
    if (!productId) return false;
    return state.wishlist.items.some(item => {
        const itemId = item.id || item._id;
        return itemId === productId;
    });
};

// Check if wishlist is empty
export const selectIsWishlistEmpty = (state) => state.wishlist.items.length === 0;

// Get wishlist item by ID
export const selectWishlistItemById = (id) => (state) =>
    state.wishlist.items.find(item => {
        const itemId = item.id || item._id;
        return itemId === id;
    });

// ========================================
// ACTIONS
// ========================================

export const {
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    showWishlistToast,
    clearWishlistToast
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
