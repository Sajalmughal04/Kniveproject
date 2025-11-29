import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, LogOut } from 'lucide-react';
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
      badge: stats.products
    },
    {
      id: 'orders',
      icon: ShoppingCart,
      label: 'Orders',
      badge: stats.orders
    },
    {
      id: 'customers',
      icon: Users,
      label: 'Customers',
      badge: stats.customers
    },
    {
      id: 'promocodes',
      icon: Tag,
      label: 'Promo Codes',
      badge: null
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
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Knives Admin</h1>
        <p className="text-xs text-gray-500 mt-1">Management Dashboard</p>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-4 flex-1 px-3">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center px-4 py-3 mb-1 rounded-lg transition-all ${currentPage === item.id
                ? 'bg-gray-100 text-gray-900 font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <item.icon className="mr-3" size={20} />
            <span className="flex-1 text-left">{item.label}</span>
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
        className="flex items-center px-6 py-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors border-t border-gray-200 m-3 rounded-lg"
      >
        <LogOut className="mr-2" size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
}