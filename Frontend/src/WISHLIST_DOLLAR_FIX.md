# Quick Fix: Change Wishlist Prices to Dollars

## File: Wishlist.jsx

### Change Line 151:
```javascript
// FROM:
Rs. {productPrice.toFixed(2)}

// TO:
${productPrice.toFixed(2)}
```

### Change Line 155:
```javascript
// FROM:
Rs. {item.oldPrice.toFixed(2)}

// TO:
${item.oldPrice.toFixed(2)}
```

That's it! Just replace `Rs.` with `$` in these two locations.
