// src/App.jsx - COMPLETE FIXED CODE
import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./Knive/Navbar";
import Footer from "./Knive/Footer";
import WhatsAppButton from "./Knive/WhatsappButton";
import { CartProvider } from "./Knive/CartContext";
import { WishlistProvider } from "./Knive/WishlistContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// ✅ Lazy-loaded user pages
const ShopPage = lazy(() => import("./Knive/ShopPage.jsx"));
const CategoryPage = lazy(() => import("./Knive/CategoryPage.jsx"));
const AllCategoriesPage = lazy(() => import("./Knive/AllCategoriesPage.jsx"));
const ProductDetail = lazy(() => import("./Knive/ProductDetail.jsx"));
const CartPage = lazy(() => import("./Knive/CartPage.jsx"));
const CheckoutPage = lazy(() => import("./Knive/CheckoutPage.jsx"));
const PaymentSuccess = lazy(() => import("./Knive/PaymentSuccess.jsx"));
const LoginPage = lazy(() => import("./Knive/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./Knive/RegisterPage.jsx"));
const ProfilePage = lazy(() => import("./Knive/ProfilePage.jsx"));
const AboutPage = lazy(() => import("./Knive/AboutPage.jsx"));
const ContactPage = lazy(() => import("./Knive/ContactPage.jsx"));
const FAQs = lazy(() => import("./Knive/FAQS.jsx"));
const Wishlist = lazy(() => import("./Knive/Wishlist.jsx"));
const OrderTrackingPage = lazy(() => import("./Knive/OrderTrackingPage.jsx"));
const ReviewPage = lazy(() => import("./Knive/ReviewPage.jsx"));

// ✅ Lazy-loaded admin pages
const AdminPanel = lazy(() => import("./Admin/AdminPanel.jsx"));
const AdminLogin = lazy(() => import("./Admin/AdminLogin.jsx"));

// ✅ Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-[500px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 text-xl font-semibold animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

// ✅ Scroll To Top Component
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  
  return null;
}

// ✅ Protected User Route
function ProtectedRoute({ children, user }) {
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
}

// 🔐 Admin Protected Route
function AdminProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    if (hasVerified) return;
    setHasVerified(true);
    verifyAdminToken();
  }, [hasVerified]);

  const verifyAdminToken = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:3000/api/admin/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Admin verification error:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// ✅ User Layout
function UserLayout({ user, setUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <Navbar 
        setSearchTerm={setSearchTerm} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        user={user} 
        setUser={setUser} 
      />
      <ScrollToTop />

      <main className="flex-grow pt-20">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ShopPage searchTerm={searchTerm} />} />
            <Route path="/shop" element={<ShopPage searchTerm={searchTerm} />} />
            
            {/* ✅ Category Routes */}
            <Route path="/categories" element={<AllCategoriesPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            
            {/* ✅ Product Routes - No addToCart prop needed */}
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/product/:id/review" element={<ReviewPage />} />
            
            {/* Cart & Wishlist */}
            <Route path="/cart" element={<CartPage user={user} />} />
            <Route path="/wishlist" element={<Wishlist />} />
            
            {/* Info Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQs />} />
            <Route path="/track-order" element={<OrderTrackingPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/register" element={<RegisterPage setUser={setUser} />} />
            
            {/* Payment Success Route */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
            
            {/* Protected Routes */}
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute user={user}>
                  <CheckoutPage user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute user={user}>
                  <ProfilePage user={user} setUser={setUser} />
                </ProtectedRoute>
              } 
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <WhatsAppButton />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === "dark" ? "dark" : "light"}
      />
    </div>
  );
}

// ✅ 404 Not Found Component
function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-500 mb-4">404</h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-6">
          Page Not Found
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg transition"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

// ✅ Main App
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
            Loading Application...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/*" 
          element={
            <AdminProtectedRoute>
              <AdminPanel />
            </AdminProtectedRoute>
          } 
        />

        {/* User Routes - Wrapped in CartProvider & WishlistProvider */}
        <Route 
          path="/*" 
          element={
            <CartProvider>
              <WishlistProvider>
                <UserLayout user={user} setUser={setUser} />
              </WishlistProvider>
            </CartProvider>
          }
        />
      </Routes>
    </Router>
  );
}
