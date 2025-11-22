// src/App.jsx - FIXED WITH PROPER IMPORTS
import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "./Redux/store.js";
import { selectToast, clearToast } from "./Redux/slice/cartSlice.js";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Import Components
import Navbar from "./Knive/Navbar";
import Footer from "./Knive/Footer";
import WhatsAppButton from "./Knive/WhatsappButton";
import { WishlistProvider } from "./Knive/WishlistContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🔐 Import Admin Protected Route from separate file
import ProtectedRoute from "./Admin/ProtectedRoute.jsx"; // ✅ Admin protection
import UserProtectedRoute from "./Knive/UserProtectedRoute.jsx"; // ✅ User protection

// ✅ Lazy load pages
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
const Dashboard = lazy(() => import("./Admin/Dashboard.jsx"));
const AdminPanel = lazy(() => import("./Admin/AdminPanel.jsx"));

// ✅ Loading Spinner
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

// ✅ Scroll To Top
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  
  return null;
}

// ✅ Redux Toast
function ReduxToast() {
  const toast = useSelector(selectToast);
  const dispatch = useDispatch();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  return (
    <AnimatePresence mode="wait">
      {toast && (
        <motion.div
          key={toast}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl shadow-lg z-50 text-sm font-medium"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 🚫 Unauthorized Page
function UnauthorizedPage() {
  const navigate = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Access Denied
        </h1>

        <p className="text-gray-300 mb-2">
          You don't have permission to access this area.
        </p>
        
        <p className="text-gray-400 text-sm mb-6">
          This page is restricted to administrators only.
        </p>

        <div className="border-t border-gray-700 my-6"></div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
          >
            Go to Home
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>

        <p className="text-gray-500 text-xs mt-6">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}

// ✅ User Layout
function UserLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

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
      />
      <ScrollToTop />

      <main className="flex-grow pt-20">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<ShopPage searchTerm={searchTerm} />} />
            <Route path="/shop" element={<ShopPage searchTerm={searchTerm} />} />
            <Route path="/home" element={<ShopPage searchTerm={searchTerm} />} />
            
            <Route path="/categories" element={<AllCategoriesPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/product/:id/review" element={<ReviewPage />} />
            
            <Route path="/cart" element={<CartPage user={user} />} />
            <Route path="/wishlist" element={<Wishlist />} />
            
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQs />} />
            <Route path="/track-order" element={<OrderTrackingPage />} />
            
            {/* Login/Register Routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  user?.role === 'admin' ? (
                    <Navigate to="/Dashboard" replace />
                  ) : (
                    <Navigate to="/" replace />
                  )
                ) : (
                  <LoginPage />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <RegisterPage />
                )
              } 
            />
            
            <Route path="/payment-success" element={<PaymentSuccess />} />
            
            {/* Protected User Routes */}
            <Route 
              path="/checkout" 
              element={
                <UserProtectedRoute>
                  <CheckoutPage />
                </UserProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <UserProtectedRoute>
                  <ProfilePage />
                </UserProtectedRoute>
              } 
            />

            {/* Unauthorized Route */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <WhatsAppButton />
      
      <ReduxToast />
      
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

// ✅ 404 Not Found
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

// ✅ Main App Component
export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* 🔐 Admin Routes - Using ProtectedRoute component */}
          <Route 
            path="/Dashboard" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminPanel />
                </Suspense>
              </ProtectedRoute>
            } 
          />

          {/* 👤 User Routes */}
          <Route 
            path="/*" 
            element={
              <WishlistProvider>
                <UserLayout />
              </WishlistProvider>
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
}