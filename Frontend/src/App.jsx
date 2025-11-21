// src/App.jsx - FULLY UPDATED VERSION (COMPLETE)
import React, { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "./Redux/store.js";
import { selectToast, clearToast } from "./Redux/slice/cartSlice.js";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Knive/Navbar";
import Footer from "./Knive/Footer";
import WhatsAppButton from "./Knive/WhatsappButton";
import { WishlistProvider } from "./Knive/WishlistContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// ✅ User pages
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

// ✅ Admin pages - PROPERLY IMPORTED
const Dashboard = lazy(() => import("./Admin/Dashboard.jsx"));
const AdminPanel = lazy(() => import("./Admin/AdminPanel.jsx"));

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

// ✅ Redux Cart Toast Notification Component
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

// ✅ Protected User Route - NOW USING REDUX
function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});
  
  // ✅ If user is admin, don't allow access to user routes
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/Dashboard" replace />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
}

// 🔐 Admin Protected Route - SIMPLIFIED
function AdminProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.log('❌ No admin token found');
        setIsAuthenticated(false);
        return;
      }

      try {
        console.log('🔍 Verifying admin token...');
        const response = await axios.get('http://localhost:3000/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          console.log('✅ Admin verified!');
          setIsAuthenticated(true);
        } else {
          console.log('❌ Invalid admin token');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Admin verification failed:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
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
    console.log('🚫 Admin not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Admin authenticated, showing dashboard');
  return children;
}

// ✅ User Layout - NOW USING REDUX
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
            
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

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

// ✅ Main App - FIXED ADMIN ROUTING
export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* ✅ Admin Dashboard Route - NOW PROTECTED */}
          <Route 
            path="/Dashboard" 
            element={
              <AdminProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              </AdminProtectedRoute>
            } 
          />
          
          {/* ✅ Admin Panel Route - Already Protected */}
          <Route 
            path="/admin/*" 
            element={
              <AdminProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminPanel />
                </Suspense>
              </AdminProtectedRoute>
            } 
          />

          {/* User Routes */}
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