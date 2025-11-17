// src/components/admin/Sidebar.jsx
import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ currentPage, setCurrentPage, stats }) {
  const navigate = useNavigate();

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      badge: null 
    },
    { 
      id: 'products', 
      icon: Package, 
      label: 'Products', 
      badge: stats.products, 
      badgeColor: 'bg-blue-500' 
    },
    { 
      id: 'orders', 
      icon: ShoppingCart, 
      label: 'Orders', 
      badge: stats.orders, 
      badgeColor: 'bg-green-500' 
    },
    { 
      id: 'customers', 
      icon: Users, 
      label: 'Customers', 
      badge: stats.customers, 
      badgeColor: 'bg-purple-500' 
    }
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      delete window.axios?.defaults?.headers?.common['Authorization'];
      navigate('/admin/login');
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-2xl font-bold">Knives Admin</h1>
        <p className="text-xs text-gray-400 mt-1">Management Dashboard</p>
      </div>
      
      {/* Navigation Menu */}
      <nav className="mt-6 flex-1">
        {menuItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setCurrentPage(item.id)} 
            className={`w-full flex items-center px-6 py-3 transition-colors ${
              currentPage === item.id 
                ? 'bg-gray-800 border-l-4 border-blue-500' 
                : 'hover:bg-gray-800'
            }`}
          >
            <item.icon className="mr-3" size={20} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge !== null && (
              <span className={`${item.badgeColor} text-xs px-2 py-1 rounded-full`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
      
      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="flex items-center px-6 py-4 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
      >
        <LogOut className="mr-2" size={20} />
        Logout
      </button>
    </div>
  );
}