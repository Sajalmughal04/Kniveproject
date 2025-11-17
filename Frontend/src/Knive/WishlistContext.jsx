// src/Knive/WishlistContext.jsx - COMPLETE FIX
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      const parsed = saved ? JSON.parse(saved) : [];
      console.log("📦 Initial wishlist loaded:", parsed.length, "items");
      return parsed;
    } catch (error) {
      console.error("❌ Error loading wishlist:", error);
      return [];
    }
  });

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      console.log("💾 Wishlist saved:", wishlist.length, "items");
    } catch (error) {
      console.error("❌ Error saving wishlist:", error);
    }
  }, [wishlist]);

  // ✅ FIXED - Toggle with better error handling
  const toggleWishlist = (product) => {
    console.log("🔄 Toggle wishlist called with:", product);

    // Extract ID with multiple fallbacks
    const productId = product?.id || product?._id;
    
    if (!productId) {
      console.error("❌ No valid ID found in product:", product);
      toast.error("Cannot update wishlist - Invalid product data");
      return;
    }

    console.log("✅ Product ID found:", productId);

    setWishlist((prev) => {
      // Check if product exists
      const existingIndex = prev.findIndex(item => {
        const itemId = item.id || item._id;
        return itemId === productId;
      });

      if (existingIndex !== -1) {
        // Remove from wishlist
        console.log("🗑️ Removing product from wishlist:", productId);
        const updated = prev.filter((_, index) => index !== existingIndex);
        
        toast.info(`${product.name || product.title || "Product"} removed from wishlist`, {
          position: "top-right",
          autoClose: 2000,
        });
        
        return updated;
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
          description: product.description || "No description available"
        };
        
        console.log("📝 New wishlist item:", newItem);
        
        toast.success(`${newItem.name} added to wishlist!`, {
          position: "top-right",
          autoClose: 2000,
        });
        
        return [...prev, newItem];
      }
    });
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    if (!productId) return false;
    
    const exists = wishlist.some(item => {
      const itemId = item.id || item._id;
      return itemId === productId;
    });
    
    console.log(`🔍 Check if ${productId} in wishlist:`, exists);
    return exists;
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    console.log("🗑️ Clearing entire wishlist");
    setWishlist([]);
    localStorage.removeItem("wishlist");
    toast.info("Wishlist cleared", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    toggleWishlist,
    isInWishlist,
    clearWishlist
  };

  console.log("🎯 WishlistContext value:", {
    count: wishlist.length,
    items: wishlist.map(i => ({ id: i.id || i._id, name: i.name }))
  });

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};