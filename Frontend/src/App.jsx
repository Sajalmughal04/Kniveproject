// src/App.jsx - FIXED ADMIN ROUTES
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

// 🔐 Import Protected Routes
import ProtectedRoute from "./Admin/ProtectedRoute.jsx";
import UserProtectedRoute from "./Knive/UserProtectedRoute.jsx";

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

// ✅ 404 Not Found Page
function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.log('🚫 ========================================');
    console.log('🚫 404 PAGE NOT FOUND');
    console.log('🚫 Attempted URL:', location.pathname);
    console.log('🚫 ========================================');
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 mb-4">
            404
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mb-8 rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-lg mb-2">
            The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            URL: <span className="text-yellow-500 font-mono">{location.pathname}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-48 h-48 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center border-4 border-gray-700">
            <svg 
              className="w-24 h-24 text-yellow-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Home
          </button>

          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 border-2 border-gray-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 pt-8 border-t border-gray-800"
        >
          <p className="text-gray-600 text-sm">
            Error Code: <span className="text-yellow-500 font-mono">404 NOT_FOUND</span>
          </p>
          <p className="text-gray-700 text-xs mt-2">
            If you think this is a mistake, please contact support
          </p>
        </motion.div>
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
            {/* Public Routes */}
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
                    <Navigate to="/admin/dashboard" replace />
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

// ✅ MAIN APP COMPONENT - FIXED ADMIN ROUTES
export default function App() {
  useEffect(() => {
    console.log('🚀 ========================================');
    console.log('🚀 APPLICATION STARTED');
    console.log('🚀 Checking authentication tokens...');
    
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');
    
    console.log('🔑 Admin Token:', adminToken ? 'EXISTS ✅' : 'NOT FOUND ❌');
    console.log('🔑 User Token:', userToken ? 'EXISTS ✅' : 'NOT FOUND ❌');
    console.log('🚀 ========================================');
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* ========================================
              🔐 ADMIN ROUTES - STRICTLY PROTECTED
              ======================================== */}
          
          {/* ✅ /admin → AdminPanel (Sidebar wala page) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminPanel />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* ✅ /admin/dashboard → AdminPanel with Dashboard */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminPanel />
                </Suspense>
              </ProtectedRoute>
            } 
          />

          {/* ✅ /admin/* → All admin sub-routes */}
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

          {/* ⚠️ DEPRECATED: /Dashboard redirect (backward compatibility) */}
          <Route 
            path="/Dashboard" 
            element={<Navigate to="/admin/dashboard" replace />}
          />

          {/* ========================================
              👤 USER ROUTES - PUBLIC & PROTECTED
              ======================================== */}
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