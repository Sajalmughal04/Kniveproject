// src/Admin/ProtectedRoute.jsx - VISITOR BLOCKING FIX
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    isAdmin: null,
    isLoading: true,
    userRole: null
  });

  const reduxAuth = useSelector((state) => state.auth || {});

  useEffect(() => {
    console.log('🔐 ProtectedRoute: Starting verification...');
    verifyUserAccess();
  }, []);

  const verifyUserAccess = async () => {
    try {
      console.log('🔍 Step 1: Checking tokens...');
      
      // Get tokens from localStorage
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('token');

      console.log('🔑 Admin Token:', adminToken ? 'FOUND ✅' : 'NOT FOUND ❌');
      console.log('🔑 User Token:', userToken ? 'FOUND ✅' : 'NOT FOUND ❌');
      console.log('📊 Redux Auth:', reduxAuth);
      console.log('📊 Redux User Role:', reduxAuth.user?.role);

      // 🚫 CHECK 1: NO TOKENS AT ALL (Visitor/Guest)
      if (!adminToken && !userToken) {
        console.log('❌ ========================================');
        console.log('❌ NO TOKENS FOUND - VISITOR/GUEST USER');
        console.log('❌ Blocking access to admin area');
        console.log('❌ ========================================');
        
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          userRole: 'guest'
        });
        return;
      }

      // 🚫 CHECK 2: Redux shows regular user is logged in
      if (reduxAuth.isAuthenticated && reduxAuth.user?.role === 'user') {
        console.log('❌ ========================================');
        console.log('❌ REGULAR USER DETECTED FROM REDUX');
        console.log('❌ User role:', reduxAuth.user.role);
        console.log('❌ Blocking admin access');
        console.log('❌ ========================================');
        
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          userRole: 'user'
        });
        return;
      }

      // 🚫 CHECK 3: Only user token exists (no admin token)
      if (!adminToken && userToken) {
        console.log('❌ ========================================');
        console.log('❌ ONLY USER TOKEN FOUND');
        console.log('❌ This is a regular user, not admin');
        console.log('❌ Blocking admin access');
        console.log('❌ ========================================');
        
        setAuthState({
          isAuthenticated: true,
          isAdmin: false,
          isLoading: false,
          userRole: 'user'
        });
        return;
      }

      // 🚫 CHECK 4: Redux shows customer
      if (reduxAuth.user?.role === 'customer') {
        console.log('❌ ========================================');
        console.log('❌ CUSTOMER ROLE DETECTED');
        console.log('❌ Blocking admin access');
        console.log('❌ ========================================');
        
        setAuthState({
          isAuthenticated: true,
          isAdmin: false,
          isLoading: false,
          userRole: 'customer'
        });
        return;
      }

      // ✅ Admin token exists - Verify with backend
      console.log('🔄 Step 2: Admin token found, verifying with backend...');
      console.log('📡 Calling API: http://localhost:3000/api/admin/profile');
      
      const response = await axios.get('http://localhost:3000/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('📥 Backend Response:', response.data);

      // Extract role from response
      let userRole = null;
      
      if (response.data.success) {
        userRole = 
          response.data.data?.role ||
          response.data.admin?.role ||
          response.data.user?.role ||
          response.data.role;
      }

      console.log('👤 User Role from backend:', userRole);

      // ✅ Final Check: Is user actually admin?
      if (userRole === 'admin') {
        console.log('✅ ========================================');
        console.log('✅ ADMIN VERIFIED SUCCESSFULLY');
        console.log('✅ Granting access to admin dashboard');
        console.log('✅ ========================================');
        
        setAuthState({
          isAuthenticated: true,
          isAdmin: true,
          isLoading: false,
          userRole: 'admin'
        });
      } else {
        console.log('❌ ========================================');
        console.log('❌ BACKEND VERIFICATION FAILED');
        console.log('❌ Role is not admin:', userRole);
        console.log('❌ Clearing invalid tokens...');
        console.log('❌ ========================================');
        
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          userRole: userRole || 'unknown'
        });
      }

    } catch (error) {
      console.error('❌ ========================================');
      console.error('❌ VERIFICATION ERROR');
      console.error('❌ Error:', error.message);
      console.error('❌ Error Response:', error.response?.data);
      console.error('❌ Error Status:', error.response?.status);
      console.error('❌ ========================================');

      // If error (invalid/expired token), clear everything
      console.log('🗑️ Clearing tokens due to error...');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        userRole: 'error'
      });
    }
  };

  // Loading state - Show for maximum 2 seconds
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">🔐 Verifying Admin Access...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  // ❌ ACCESS DENIED - Show Unauthorized Page
  if (!authState.isAuthenticated || !authState.isAdmin) {
    console.log('🚫 ========================================');
    console.log('🚫 ACCESS DENIED TO ADMIN DASHBOARD');
    console.log('🚫 Reason:');
    console.log('🚫   - isAuthenticated:', authState.isAuthenticated);
    console.log('🚫   - isAdmin:', authState.isAdmin);
    console.log('🚫   - userRole:', authState.userRole);
    console.log('🚫 Redirecting to /unauthorized');
    console.log('🚫 ========================================');
    
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ ADMIN ACCESS GRANTED - Show Dashboard
  console.log('✅ ========================================');
  console.log('✅ ADMIN ACCESS GRANTED');
  console.log('✅ Rendering Admin Dashboard');
  console.log('✅ ========================================');
  
  return children;
};

export default ProtectedRoute;