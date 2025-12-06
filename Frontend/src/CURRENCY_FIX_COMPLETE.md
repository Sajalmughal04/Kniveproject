# Complete Price Currency Fix - Rs. to $

## Overview
Based on your screenshot, prices are showing as "Rs. 187.04" but should show as "$187.04". Here's a complete guide to fix all price displays across the website.

---

## Files to Update

### 1. AllProducts.jsx

**Lines to Change:**

**Line 339** (Discounted price):
```javascript
// CHANGE FROM:
Rs. {finalPrice.toLocaleString()}
// TO:
${finalPrice.toLocaleString()}
```

**Line 342** (Original price strikethrough):
```javascript
// CHANGE FROM:
Rs. {product.price.toLocaleString()}
// TO:
${product.price.toLocaleString()}
```

**Line 346** (Savings amount):
```javascript
// CHANGE FROM:
Save Rs. {savings.toLocaleString()}
// TO:
Save ${savings.toLocaleString()}
```

**Line 352** (Regular price - no discount):
```javascript
// CHANGE FROM:
Rs. {product.price.toLocaleString()}
// TO:
${product.price.toLocaleString()}
```

---

### 2. Wishlist.jsx

**Line 151** (Main price):
```javascript
// CHANGE FROM:
Rs. {productPrice.toFixed(2)}
// TO:
${productPrice.toFixed(2)}
```

**Line 155** (Old price):
```javascript
// CHANGE FROM:
Rs. {item.oldPrice.toFixed(2)}
// TO:
${item.oldPrice.toFixed(2)}
```

---

### 3. ProductDetail.jsx

Search for any instances of `Rs.` and replace with `$`

Common locations:
- Price display
- Discount price
- Savings amount

---

### 4. CartPage.jsx

Check for currency display in:
- Item prices
- Subtotals
- Total amount

Replace `Rs.` with `$`

---

### 5. CheckoutPage.jsx

Check for currency display in:
- Order summary
- Item prices
- Total amount
- Shipping costs

Replace `Rs.` with `$`

---

## Quick Find & Replace

**For each file, use Find & Replace:**
- Find: `Rs. {`
- Replace: `${`

**OR**

- Find: `Rs.`
- Replace: `$`

---

## Files That Likely Need Updates

Based on common e-commerce patterns:

1. ✅ **AllProducts.jsx** - Product grid prices
2. ✅ **Wishlist.jsx** - Wishlist item prices
3. ⚠️ **ProductDetail.jsx** - Single product view
4. ⚠️ **CartPage.jsx** - Shopping cart
5. ⚠️ **CheckoutPage.jsx** - Checkout summary
6. ⚠️ **Admin/ProductsTable.jsx** - Admin product list
7. ⚠️ **Admin/Dashboard.jsx** - Revenue display

---

## Testing Checklist

After making changes, verify:
- [ ] Product cards show $ prices
- [ ] Product detail page shows $ prices
- [ ] Cart shows $ prices
- [ ] Checkout shows $ prices
- [ ] Wishlist shows $ prices
- [ ] Admin dashboard shows $ revenue
- [ ] All discount/savings amounts show $

---

## Example: Before & After

**Before:**
```javascript
<span>Rs. {product.price.toFixed(2)}</span>
```

**After:**
```javascript
<span>${product.price.toFixed(2)}</span>
```

---

## Summary

**Total Changes Needed:**
- AllProducts.jsx: 4 locations
- Wishlist.jsx: 2 locations
- ProductDetail.jsx: Check and update
- CartPage.jsx: Check and update
- CheckoutPage.jsx: Check and update
- Admin files: Check and update

**Quick Method:**
Use your code editor's "Find in Files" feature:
1. Search for: `Rs.`
2. In directory: `src/Knive` and `src/Admin`
3. Replace all with: `$`
