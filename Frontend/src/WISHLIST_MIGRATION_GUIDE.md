# Wishlist Migration Guide - Context to Redux

## Overview
This guide will help you migrate from WishlistContext to Redux for wishlist management.

---

## Step 1: Update Navbar.jsx

### Current Code (Lines 20, 24):
```javascript
import { useWishlist } from "./WishlistContext";
// ...
const { wishlistCount } = useWishlist();
```

### New Code:
```javascript
import { useSelector } from 'react-redux';
import { selectWishlistCount } from '../Redux/slice/wishlistSlice';
// ...
const wishlistCount = useSelector(selectWishlistCount);
```

---

## Step 2: Update AllProducts.jsx

### Current Code (Lines 7, 17):
```javascript
import { useWishlist } from "./WishlistContext";
// ...
const { toggleWishlist, isInWishlist } = useWishlist();
```

### New Code:
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist, selectIsInWishlist } from '../Redux/slice/wishlistSlice';
import { toast } from 'react-toastify';
// ...
const dispatch = useDispatch();

// In the component where you check if item is in wishlist:
const inWishlist = useSelector(selectIsInWishlist(product._id));

// In handleToggleWishlist function:
const handleToggleWishlist = (product, e) => {
  e.stopPropagation();
  
  if (!product || !product._id) {
    console.error("❌ Invalid product data for wishlist:", product);
    return;
  }

  const wishlistItem = {
    id: product._id,
    _id: product._id,
    name: product.title,
    title: product.title,
    price: product.hasDiscount ? product.finalPrice : product.price,
    originalPrice: product.price,
    hasDiscount: product.hasDiscount,
    discountType: product.discountType,
    discountValue: product.discountValue,
    image: product.images && product.images.length > 0
      ? product.images[0].url
      : "https://via.placeholder.com/400",
    category: product.category,
    stock: product.stock,
    description: product.description
  };

  dispatch(toggleWishlist(wishlistItem));
  
  // Show toast notification
  const inWishlist = useSelector(selectIsInWishlist(product._id));
  if (inWishlist) {
    toast.info(`${product.title} removed from wishlist`, {
      position: "top-right",
      autoClose: 2000,
    });
  } else {
    toast.success(`${product.title} added to wishlist!`, {
      position: "top-right",
      autoClose: 2000,
    });
  }
};
```

---

## Step 3: Update ProductDetail.jsx

### Current Code (Lines 9, 16):
```javascript
import { useWishlist } from "./WishlistContext";
// ...
const { toggleWishlist, isInWishlist } = useWishlist();
```

### New Code:
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist, selectIsInWishlist } from '../Redux/slice/wishlistSlice';
import { toast } from 'react-toastify';
// ...
const dispatch = useDispatch();
const inWishlist = useSelector(selectIsInWishlist(product._id));

// Update handleToggleWishlist function (around line 169):
const handleToggleWishlist = () => {
  if (!product || !product._id) {
    console.error("❌ Product data missing!");
    return;
  }

  const wishlistItem = {
    id: product._id,
    _id: product._id,
    name: product.title,
    title: product.title,
    price: finalPrice,
    originalPrice: productPrice,
    hasDiscount,
    discountType,
    discountValue,
    image: images && images.length > 0 ? images[0] : "placeholder",
    category: product.category,
    stock: product.stock,
    description: product.description
  };

  console.log("🔄 Toggling wishlist for:", wishlistItem);
  dispatch(toggleWishlist(wishlistItem));
  
  // Toast is handled by Redux slice
};
```

---

## Step 4: Update Wishlist.jsx

### Current Code (Lines 6, 13):
```javascript
import { useWishlist } from "./WishlistContext";
// ...
const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
```

### New Code:
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectWishlistItems, 
  toggleWishlist, 
  clearWishlist 
} from '../Redux/slice/wishlistSlice';
import { toast } from 'react-toastify';
// ...
const dispatch = useDispatch();
const wishlist = useSelector(selectWishlistItems);

// Update handleRemove function:
const handleRemove = (product) => {
  dispatch(toggleWishlist(product));
  toast.info(`${product.title || product.name} removed from wishlist`, {
    position: "top-right",
    autoClose: 2000,
  });
};

// Update handleClearAll function:
const handleClearAll = () => {
  if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
    dispatch(clearWishlist());
    toast.info("Wishlist cleared", {
      position: "top-right",
      autoClose: 2000,
    });
  }
};
```

---

## Step 5: Update App.jsx

### Remove WishlistProvider

Find and remove these lines:
```javascript
// REMOVE:
import { WishlistProvider } from './Knive/WishlistContext';

// REMOVE the WishlistProvider wrapper:
<WishlistProvider>
  {/* your app content */}
</WishlistProvider>
```

The Redux Provider is already in place, so you don't need the WishlistProvider anymore.

---

## Step 6: Delete Old Files

After verifying everything works, delete:
```
src/Knive/WishlistContext.jsx
```

---

## Quick Reference: Redux Hooks

### Import:
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  toggleWishlist, 
  clearWishlist,
  selectWishlistItems,
  selectWishlistCount,
  selectIsInWishlist
} from '../Redux/slice/wishlistSlice';
```

### Usage:
```javascript
const dispatch = useDispatch();

// Get wishlist items
const wishlist = useSelector(selectWishlistItems);

// Get wishlist count
const wishlistCount = useSelector(selectWishlistCount);

// Check if product is in wishlist
const inWishlist = useSelector(selectIsInWishlist(productId));

// Toggle wishlist
dispatch(toggleWishlist(productData));

// Clear wishlist
dispatch(clearWishlist());
```

---

## Benefits of Redux Migration

✅ **Centralized State** - All state in one place  
✅ **Better DevTools** - Redux DevTools for debugging  
✅ **Automatic Persistence** - Built-in localStorage sync  
✅ **Logout Integration** - Auto-clears on logout  
✅ **Type Safety** - Better with TypeScript  
✅ **Performance** - Optimized re-renders  

---

## Testing Checklist

After migration, test:
- [ ] Add item to wishlist
- [ ] Remove item from wishlist
- [ ] Wishlist count updates in navbar
- [ ] Wishlist page displays items correctly
- [ ] Clear all wishlist items
- [ ] Wishlist persists after page refresh
- [ ] Wishlist clears on logout
- [ ] Toast notifications work

---

## Troubleshooting

### Issue: "Cannot read property 'items' of undefined"
**Solution**: Make sure wishlistReducer is added to store.js

### Issue: "selectIsInWishlist is not a function"
**Solution**: Check import statement, should be:
```javascript
import { selectIsInWishlist } from '../Redux/slice/wishlistSlice';
```

### Issue: Wishlist not persisting
**Solution**: Check browser console for localStorage errors. Clear localStorage and try again.

---

## Summary

**Files Created:**
- ✅ `Redux/slice/wishlistSlice.js`

**Files Modified:**
- ✅ `Redux/store.js`
- ⏳ `Knive/Navbar.jsx`
- ⏳ `Knive/AllProducts.jsx`
- ⏳ `Knive/ProductDetail.jsx`
- ⏳ `Knive/Wishlist.jsx`
- ⏳ `App.jsx`

**Files to Delete:**
- ⏳ `Knive/WishlistContext.jsx`

All set! Follow the steps above to complete the migration. 🚀
