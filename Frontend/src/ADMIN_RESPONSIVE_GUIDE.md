# Admin Panel - Complete Responsive Guide

## Overview
This guide provides complete responsive design fixes for all Admin panel components. The Admin panel needs special attention for mobile devices as it contains complex tables and data displays.

---

## 1. AdminPanel.jsx - Main Container

### Issue
- Fixed sidebar takes up too much space on mobile
- Content padding too large on small screens

### Fix (Lines 126-141)

```javascript
// CHANGE:
<div className="flex h-screen bg-gray-50">
  <Sidebar ... />
  <div className="flex-1 overflow-auto">
    <LoadingIndicator loading={loading} />
    <div className="p-8">

// TO:
<div className="flex flex-col md:flex-row h-screen bg-gray-50">
  <Sidebar ... />
  <div className="flex-1 overflow-auto">
    <LoadingIndicator loading={loading} />
    <div className="p-4 sm:p-6 md:p-8">
```

---

## 2. Sidebar.jsx - Navigation

### Issues
- Fixed width sidebar doesn't work on mobile
- Takes up entire screen width on small devices
- No mobile menu toggle

### Complete Responsive Sidebar

Replace the entire Sidebar component with this mobile-friendly version:

```javascript
import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ currentPage, setCurrentPage, stats }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { id: 'products', icon: Package, label: 'Products', badge: stats.products },
    { id: 'orders', icon: ShoppingCart, label: 'Orders', badge: stats.orders },
    { id: 'customers', icon: Users, label: 'Customers', badge: stats.customers },
    { id: 'promocodes', icon: Tag, label: 'Promo Codes', badge: null }
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      delete window.axios?.defaults?.headers?.common['Authorization'];
      navigate('/admin/login');
    }
  };

  const handleMenuClick = (id) => {
    setCurrentPage(id);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Knives Admin</h1>
          <p className="text-xs text-gray-500 mt-1">Management Dashboard</p>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-4 flex-1 px-3 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center px-4 py-3 mb-1 rounded-lg transition-all ${
                currentPage === item.id
                  ? 'bg-gray-100 text-gray-900 font-medium shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 flex-shrink-0" size={20} />
              <span className="flex-1 text-left text-sm sm:text-base">{item.label}</span>
              {item.badge !== null && (
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center px-4 sm:px-6 py-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border-t border-gray-200 m-3 rounded-lg"
        >
          <LogOut className="mr-2 flex-shrink-0" size={20} />
          <span className="font-medium text-sm sm:text-base">Logout</span>
        </button>
      </div>
    </>
  );
}
```

---

## 3. Dashboard.jsx - Stats & Cards

### Fix Header (Line 61)
```javascript
// CHANGE:
<div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">

// TO:
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
  <div className="mb-0">
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h2>
```

### Fix Stats Grid (Line 89)
```javascript
// Already responsive - keep as is:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
```

### Fix Recent Orders/Low Stock (Lines 96-159)
```javascript
// CHANGE:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

// TO:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
  {/* Recent Orders */}
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
    <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Recent Orders</h3>
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="space-y-3 px-4 sm:px-0">
          {/* order items */}
        </div>
      </div>
    </div>
  </div>
```

---

## 4. ProductsTable.jsx - Responsive Table

### Major Issue
Tables don't work well on mobile. Need card view for mobile, table for desktop.

### Complete Responsive Solution

Replace ProductsTable.jsx with this responsive version:

```javascript
import React, { useState } from 'react';
import { Edit2, Trash2, Tag, TrendingDown, Grid, List } from 'lucide-react';

export default function ProductsTable({ products, onEdit, onDelete }) {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Card View for Mobile
  const CardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => {
        const hasDiscount = product.hasDiscount || (product.discountValue > 0 && product.discountType !== 'none');
        const finalPrice = hasDiscount ? product.finalPrice : product.price;
        const savings = hasDiscount ? product.price - finalPrice : 0;

        return (
          <div key={product._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition">
            {/* Image */}
            <div className="relative">
              <img
                src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                alt={product.title}
                className="w-full h-48 object-cover"
              />
              {hasDiscount && (
                <span className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full font-bold">
                  {product.discountType === 'percentage'
                    ? `-${product.discountValue}%`
                    : `-Rs. ${product.discountValue}`}
                </span>
              )}
              {product.featured && (
                <span className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-medium">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>

              {/* Price */}
              <div className="mb-3">
                {hasDiscount ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-gray-900">Rs. {finalPrice?.toLocaleString() || '0'}</p>
                    </div>
                    <p className="text-sm text-gray-400 line-through">Rs. {product.price?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-gray-600 font-medium">Save Rs. {savings.toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-gray-900">Rs. {product.price?.toLocaleString() || '0'}</p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs capitalize">{product.category}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  product.stock === 0 ? 'bg-black text-white' :
                  product.stock < 5 ? 'bg-gray-600 text-white' :
                  'bg-gray-400 text-black'
                }`}>
                  Stock: {product.stock}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                >
                  <Edit2 size={16} className="inline mr-1" /> Edit
                </button>
                <button
                  onClick={() => onDelete(product._id)}
                  className="flex-1 p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                >
                  <Trash2 size={16} className="inline mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Table View for Desktop
  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        {/* Keep existing table structure */}
        {/* ... existing table code ... */}
      </table>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* View Toggle */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Products</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded ${viewMode === 'cards' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
            title="Card View"
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded ${viewMode === 'table' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
            title="Table View"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'cards' ? <CardView /> : <TableView />}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      )}
    </div>
  );
}
```

---

## 5. OrdersPage.jsx - Orders Table

### Add Responsive Card View

Similar to ProductsTable, add a card view for mobile:

```javascript
// Add at the top of the component
const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'cards' : 'table');

// Card view for orders
const OrderCard = ({ order }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition">
    <div className="flex justify-between items-start mb-3">
      <div>
        <p className="font-semibold text-gray-900">#{order.orderNumber || order._id?.slice(-6)}</p>
        <p className="text-sm text-gray-500">{order.customerInfo?.name}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
        order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {order.status || 'pending'}
      </span>
    </div>
    <div className="space-y-2 text-sm">
      <p className="text-gray-600">Total: <span className="font-bold text-gray-900">Rs. {order.totalAmount?.toFixed(2)}</span></p>
      <p className="text-gray-600">Items: {order.items?.length || 0}</p>
      <p className="text-gray-600">Payment: <span className="capitalize">{order.paymentMethod}</span></p>
    </div>
    <div className="mt-3 flex gap-2">
      <button className="flex-1 text-sm bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700">
        View Details
      </button>
    </div>
  </div>
);
```

---

## 6. PromoCodesPage.jsx - Promo Codes

### Make Form Responsive

```javascript
// Update form grid (around line 200-250)
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* form fields */}
</div>

// Update buttons
<div className="flex flex-col sm:flex-row gap-3 pt-4">
  <button className="flex-1 ...">Cancel</button>
  <button className="flex-1 ...">Save</button>
</div>
```

---

## 7. Additional CSS for Admin

Add to `responsive-enhancements.css`:

```css
/* Admin Panel Responsive Fixes */

/* Mobile sidebar spacing */
@media (max-width: 768px) {
  .admin-content {
    padding-left: 0 !important;
  }
}

/* Scrollable tables on mobile */
.admin-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.admin-table {
  min-width: 800px;
}

/* Better touch targets for admin buttons */
@media (max-width: 640px) {
  .admin-action-button {
    min-width: 44px;
    min-height: 44px;
  }
}

/* Stats cards responsive */
@media (max-width: 640px) {
  .stats-card {
    padding: 1rem !important;
  }
  
  .stats-card h3 {
    font-size: 1.5rem !important;
  }
}
```

---

## Summary of Changes

| Component | Key Changes |
|-----------|-------------|
| **AdminPanel** | Flex-col on mobile, reduced padding |
| **Sidebar** | Mobile menu with hamburger, slide-in animation |
| **Dashboard** | Responsive header, scrollable cards |
| **ProductsTable** | Card view for mobile, table for desktop |
| **OrdersPage** | Card view for orders on mobile |
| **PromoCodesPage** | Responsive form grid |

---

## Testing Checklist

- [ ] Sidebar slides in/out on mobile
- [ ] Tables switch to card view on mobile
- [ ] All buttons are touch-friendly (44x44px)
- [ ] Forms stack vertically on mobile
- [ ] Stats cards display properly
- [ ] No horizontal scrolling (except tables)
- [ ] Navigation works on all screen sizes

---

## Priority Implementation Order

1. **Sidebar** (Most Important) - Blocks mobile access
2. **ProductsTable** - Core functionality
3. **Dashboard** - First thing admins see
4. **OrdersPage** - Critical for order management
5. **PromoCodesPage** - Secondary feature

---

## Quick Wins

If you're short on time, implement these first:
1. Add mobile menu to Sidebar
2. Make AdminPanel flex-col on mobile
3. Add overflow-x-auto to all tables
4. Reduce padding on mobile (p-4 instead of p-8)
