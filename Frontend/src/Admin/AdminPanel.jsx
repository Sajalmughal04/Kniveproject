import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import ProductsPage from "./ProductsPage";
import OrdersPage from "./OrdersPage";
import CustomersPage from "./CustomersPage";
import LoadingIndicator from "./LoadingIndicator";

const API_URL = "http://localhost:3000/api";

// Configure axios to send token with every request
const setupAxios = () => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Setup axios on mount (removed auth check - handled by App.jsx)
  useEffect(() => {
    setupAxios();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      setupAxios();
      const response = await axios.get(`${API_URL}/orders`);
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      setupAxios();
      
      const response = await axios.get(`${API_URL}/orders`);
      const ordersData = response.data.orders || [];
      
      const uniqueCustomers = [];
      const emailSet = new Set();
      
      ordersData.forEach(order => {
        if (order.customerInfo && !emailSet.has(order.customerInfo.email)) {
          emailSet.add(order.customerInfo.email);
          uniqueCustomers.push({
            _id: order.customerInfo.email,
            name: order.customerInfo.name,
            email: order.customerInfo.email,
            phone: order.customerInfo.phone,
            address: order.customerInfo.address,
            totalOrders: ordersData.filter(o => o.customerInfo.email === order.customerInfo.email).length,
            totalSpent: ordersData
              .filter(o => o.customerInfo.email === order.customerInfo.email)
              .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
          });
        }
      });
      
      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCustomers();
  }, []);

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalCustomers: customers.length,
    revenue: Array.isArray(orders) 
      ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) 
      : 0
  };

  // ✅ Logout function
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      axios.defaults.headers.common["Authorization"] = null;
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
        stats={{
          products: products.length,
          orders: orders.length,
          customers: customers.length,
        }}
      />

      <div className="flex-1 overflow-auto">
        <LoadingIndicator loading={loading} />

        <div className="p-8">
          {currentPage === "dashboard" && (
            <Dashboard stats={stats} products={products} orders={orders} />
          )}

          {currentPage === "products" && (
            <ProductsPage
              products={products}
              fetchProducts={fetchProducts}
              setLoading={setLoading}
              API_URL={API_URL}
            />
          )}

          {currentPage === "orders" && (
            <OrdersPage
              orders={orders}
              fetchOrders={fetchOrders}
              setLoading={setLoading}
              API_URL={API_URL}
            />
          )}

          {currentPage === "customers" && (
            <CustomersPage 
              customers={customers} 
              fetchCustomers={fetchCustomers} 
            />
          )}
        </div>
      </div>
    </div>
  );
}