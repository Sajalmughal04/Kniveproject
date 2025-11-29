import React from 'react';
import { Package, ShoppingCart, Users, RefreshCw, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout as userLogout } from '../Redux/slice/authSlice.js';
import StatsCard from './StatsCard';

export default function Dashboard({ stats = {}, products = [], orders = [], onLogout }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const adminData = React.useMemo(() => {
    const data = localStorage.getItem('adminData');
    return data ? JSON.parse(data) : { name: 'Admin', email: '' };
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');

    if (!confirmed) {
      console.log('❌ Logout cancelled by user');
      return;
    }

    dispatch(userLogout());

    if (onLogout) {
      onLogout();
    } else {
      navigate('/', { replace: true });
    }
  };

  const statsData = [
    {
      label: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: Package
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart
    },
    {
      label: 'Total Customers',
      value: stats?.totalCustomers ?? 0,
      icon: Users
    },
    {
      label: 'Total Revenue',
      value: `$${Number(stats?.revenue || 0).toLocaleString()}`,
      icon: null,
      customIcon: '💰'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-4 md:mb-0">
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {adminData.name}!</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition border border-gray-300 shadow-sm"
          >
            <RefreshCw size={16} className="md:mr-2" />
            <span className="hidden md:inline">Refresh</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-all duration-200 shadow-sm font-medium"
          >
            <LogOut size={20} />
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Orders</h3>
          <div className="space-y-3">
            {orders && orders.length > 0 ? (
              orders.slice(0, 5).map(order => (
                <div key={order._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {order.customerName || 'Guest Customer'}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                    }`}>
                    {order.status || 'pending'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Low Stock Products</h3>
          <div className="space-y-3">
            {products && products.length > 0 ? (
              products.filter(p => p.stock < 10).length > 0 ? (
                products.filter(p => p.stock < 10).map(product => (
                  <div key={product._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {product.title || product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.category}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock === 0 ? 'bg-red-100 text-red-700' :
                        product.stock < 5 ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                      }`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">All products have sufficient stock</p>
              )
            ) : (
              <p className="text-gray-500 text-center py-8">No products available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}