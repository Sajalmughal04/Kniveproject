// src/Admin/ProtectedRoute.jsx - TAB-SPECIFIC SESSION SECURITY
import { Navigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    isAdmin: null,
    isLoading: true,
    userRole: null,
    tabAuthorized: null
  });

  const hasVerified = useRef(false);
  const tabIdRef = useRef(null);
  const reduxAuth = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (hasVerified.current) {
      console.log('⏭️ Already verified, skipping...');
      return;
    }

    const verifyUserAccess = async () => {
      try {
        console.log('🔐 ========================================');
        console.log('🔐 PROTECTED ROUTE: VERIFICATION STARTED');
        console.log('🔐 ========================================');
        
        // 🆔 STEP 1: Generate or get tab-specific ID
        if (!tabIdRef.current) {
          tabIdRef.current = sessionStorage.getItem('currentTabId');
          if (!tabIdRef.current) {
            tabIdRef.current = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('currentTabId', tabIdRef.current);
          }
        }
        
        console.log('🆔 Current Tab ID:', tabIdRef.current);
        
        const adminToken = localStorage.getItem('adminToken');
        const userToken = localStorage.getItem('token');
        const adminData = localStorage.getItem('adminData');
        const authorizedTabId = localStorage.getItem('authorizedAdminTab');

        console.log('🔍 Step 2: Checking tokens and authorization...');
        console.log('   Admin Token:', adminToken ? 'EXISTS ✅' : 'MISSING ❌');
        console.log('   User Token:', userToken ? 'EXISTS ✅' : 'MISSING ❌');
        console.log('   Admin Data:', adminData ? 'EXISTS ✅' : 'MISSING ❌');
        console.log('   Authorized Tab:', authorizedTabId || 'NONE');
        console.log('   Current Tab:', tabIdRef.current);

        // 🚫 CHECK 1: NO TOKENS AT ALL
        if (!adminToken && !userToken) {
          console.log('❌ ========================================');
          console.log('❌ ACCESS DENIED: NO TOKENS FOUND');
          console.log('❌ This is a VISITOR/GUEST');
          console.log('❌ Showing 404 page');
          console.log('❌ ========================================');
          
          setAuthState({
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            userRole: 'guest',
            tabAuthorized: false
          });
          hasVerified.current = true;
          return;
        }

        // 🚫 CHECK 2: Redux shows regular user
        if (reduxAuth.isAuthenticated && reduxAuth.user?.role === 'user') {
          console.log('❌ ========================================');
          console.log('❌ ACCESS DENIED: REGULAR USER');
          console.log('❌ Showing 404 page');
          console.log('❌ ========================================');
          
          setAuthState({
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            userRole: 'user',
            tabAuthorized: false
          });
          hasVerified.current = true;
          return;
        }

        // 🚫 CHECK 3: Only user token (no admin token)
        if (!adminToken && userToken) {
          console.log('❌ ========================================');
          console.log('❌ ACCESS DENIED: ONLY USER TOKEN');
          console.log('❌ Showing 404 page');
          console.log('❌ ========================================');
          
          setAuthState({
            isAuthenticated: true,
            isAdmin: false,
            isLoading: false,
            userRole: 'user',
            tabAuthorized: false
          });
          hasVerified.current = true;
          return;
        }

        // 🚫 CHECK 4: Customer role
        if (reduxAuth.user?.role === 'customer') {
          console.log('❌ ========================================');
          console.log('❌ ACCESS DENIED: CUSTOMER ROLE');
          console.log('❌ Showing 404 page');
          console.log('❌ ========================================');
          
          setAuthState({
            isAuthenticated: true,
            isAdmin: false,
            isLoading: false,
            userRole: 'customer',
            tabAuthorized: false
          });
          hasVerified.current = true;
          return;
        }

        // 🔑 CHECK 5: THIS IS THE KEY CHECK - TAB AUTHORIZATION
        if (authorizedTabId && authorizedTabId !== tabIdRef.current) {
          console.log('❌ ========================================');
          console.log('❌ ACCESS DENIED: WRONG TAB/WINDOW');
          console.log('❌ Admin is logged in ANOTHER tab/window');
          console.log('❌ Authorized Tab:', authorizedTabId);
          console.log('❌ Current Tab:', tabIdRef.current);
          console.log('❌ This tab is NOT authorized');
          console.log('❌ Showing 404 page');
          console.log('❌ ========================================');
          
          setAuthState({
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            userRole: 'unauthorized_tab',
            tabAuthorized: false
          });
          hasVerified.current = true;
          return;
        }

        // ✅ CHECK 6: Verify with backend
        console.log('🔄 ========================================');
        console.log('🔄 Step 3: Admin token found!');
        console.log('🔄 Verifying with backend API...');
        console.log('🔄 ========================================');
        
        const response = await axios.get('http://localhost:3000/api/admin/profile', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          },
          timeout: 5000
        });

        console.log('📥 Backend response received:', response.data);

        let userRole = null;
        let userEmail = null;
        
        if (response.data.success) {
          userRole = 
            response.data.data?.role ||
            response.data.admin?.role ||
            response.data.user?.role ||
            response.data.role;
            
          userEmail = 
            response.data.data?.email ||
            response.data.admin?.email ||
            response.data.user?.email ||
            response.data.email;
        }

        console.log('👤 User info from backend:');
        console.log('   Role:', userRole);
        console.log('   Email:', userEmail);

        // ✅ FINAL CHECK: Is user admin AND tab authorized?
        if (userRole === 'admin') {
          // If no authorized tab yet, authorize THIS tab
          if (!authorizedTabId) {
            console.log('🔓 No authorized tab found - authorizing THIS tab');
            localStorage.setItem('authorizedAdminTab', tabIdRef.current);
          }

          console.log('✅ ========================================');
          console.log('✅ ADMIN VERIFIED SUCCESSFULLY');
          console.log('✅ Admin email:', userEmail);
          console.log('✅ Admin role:', userRole);
          console.log('✅ This tab is AUTHORIZED');
          console.log('✅ GRANTING ACCESS');
          console.log('✅ ========================================');
          
          setAuthState({
            isAuthenticated: true,
            isAdmin: true,
            isLoading: false,
            userRole: 'admin',
            tabAuthorized: true
          });
          hasVerified.current = true;
        } else {
          console.log('❌ ========================================');
          console.log('❌ ACCESS DENIED: NOT AN ADMIN');
          console.log('❌ Clearing tokens...');
          console.log('❌ Showing 404 page');
          console.log('❌ ========================================');
          
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          localStorage.removeItem('authorizedAdminTab');
          
          setAuthState({
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            userRole: userRole || 'unknown',
            tabAuthorized: false
          });
          hasVerified.current = true;
        }

      } catch (error) {
        console.error('❌ ========================================');
        console.error('❌ VERIFICATION ERROR');
        console.error('❌ Error:', error.message);
        console.error('❌ Clearing tokens...');
        console.error('❌ Showing 404 page');
        console.error('❌ ========================================');

        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        localStorage.removeItem('authorizedAdminTab');
        
        setAuthState({
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          userRole: 'error',
          tabAuthorized: false
        });
        hasVerified.current = true;
      }
    };

    verifyUserAccess();
  }, []);

  // Loading state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-yellow-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-2xl">🔐</div>
            </div>
          </div>
          <p className="text-white text-xl font-bold mb-2">Verifying Access...</p>
          <p className="text-gray-400 text-sm">Checking admin credentials</p>
        </div>
      </div>
    );
  }

  // ❌ ACCESS DENIED
  if (!authState.isAuthenticated || !authState.isAdmin || !authState.tabAuthorized) {
    console.log('🚫 ========================================');
    console.log('🚫 FINAL CHECK: ACCESS DENIED');
    console.log('🚫 Reason:');
    console.log('   - isAuthenticated:', authState.isAuthenticated);
    console.log('   - isAdmin:', authState.isAdmin);
    console.log('   - tabAuthorized:', authState.tabAuthorized);
    console.log('   - userRole:', authState.userRole);
    console.log('🚫 REDIRECTING TO 404 PAGE');
    console.log('🚫 ========================================');
    
    return <Navigate to="/page-not-found-404" replace />;
  }

  // ✅ ADMIN ACCESS GRANTED
  console.log('✅ RENDERING ADMIN DASHBOARD');
  return children;
};

export default ProtectedRoute;