// src/components/admin/dashboard/Dashboard.jsx
import React from 'react';
import { Package, ShoppingCart, Users, RefreshCw, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout as userLogout } from '../Redux/slice/authSlice.js';
import StatsCard from './StatsCard';

export default function Dashboard({ stats = {}, products = [], orders = [] }) {
  const navigate = useNavigate();
  
  // Get admin data from localStorage
  const adminData = React.useMemo(() => {
    const data = localStorage.getItem('adminData');
    return data ? JSON.parse(data) : { name: 'Admin', email: '' };
  }, []);

  // ✅ Logout Function
  const dispatch = useDispatch();
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear admin-only storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');

      // Also clear global user auth (so admin logout signs out whole app)
      try {
        dispatch(userLogout());
      } catch (err) {
        // dispatch may not be available in some test contexts — fallback
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }

      navigate('/', { replace: true });
    }
  };

  const statsData = [
    { 
      label: 'Total Products', 
      value: stats?.totalProducts ?? 0, 
      icon: Package, 
      gradient: 'from-blue-500 to-blue-600', 
      textColor: 'text-blue-100' 
    },
    { 
      label: 'Total Orders', 
      value: stats?.totalOrders ?? 0, 
      icon: ShoppingCart, 
      gradient: 'from-green-500 to-green-600', 
      textColor: 'text-green-100' 
    },
    { 
      label: 'Total Customers', 
      value: stats?.totalCustomers ?? 0, 
      icon: Users, 
      gradient: 'from-purple-500 to-purple-600', 
      textColor: 'text-purple-100' 
    },
    { 
      label: 'Total Revenue', 
      value: `$${Number(stats?.revenue || 0).toLocaleString()}`, 
      icon: null, 
      gradient: 'from-orange-500 to-orange-600', 
      textColor: 'text-orange-100', 
      customIcon: '💰' 
    }
  ];

  return (
    <div>
      {/* Header with Admin Info & Logout */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Welcome back, {adminData.name}!</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Admin Info */}
          <div className="hidden md:flex items-center space-x-2 text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
            <User size={18} />
            <div className="text-sm">
              <p className="font-medium">{adminData.name}</p>
              <p className="text-xs text-gray-500">{adminData.email}</p>
            </div>
          </div>

          {/* Refresh Button */}
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            title="Refresh Dashboard"
          >
            <RefreshCw size={16} className="md:mr-2" />
            <span className="hidden md:inline">Refresh</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            title="Logout"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Orders & Low Stock Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Orders</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
                <div>
                  <p className="font-semibold text-gray-800">
                    {order.customerName || 'Guest Customer'}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${order.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status || 'pending'}
                </span>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Low Stock Products</h3>
          <div className="space-y-3">
            {products.filter(p => p.stock < 10).map(product => (
              <div key={product._id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
                <div>
                  <p className="font-semibold text-gray-800">
                    {product.title || product.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {product.category}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock === 0 ? 'bg-red-100 text-red-800' :
                  product.stock < 5 ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  Stock: {product.stock}
                </span>
              </div>
            ))}
            {products.filter(p => p.stock < 10).length === 0 && (
              <p className="text-gray-500 text-center py-8">All products have sufficient stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}