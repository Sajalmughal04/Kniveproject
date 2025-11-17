// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 ProtectedRoute: Starting verification...');
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('🔑 Token check:', token ? 'EXISTS ✅' : 'NOT FOUND ❌');
      
      if (!token) {
        console.log('❌ No token, user not authenticated');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      console.log('🔄 Verifying token with backend...');
      
      // Verify token with backend
      const response = await axios.get('http://localhost:3000/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📥 Backend response:', response.data);

      if (response.data.success) {
        console.log('✅ Token valid! User authenticated');
        setIsAuthenticated(true);
      } else {
        console.log('❌ Token invalid, clearing localStorage');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      console.error('❌ Error details:', error.response?.data);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      console.log('🏁 Verification complete');
    }
  };

  // Loading state
  if (isLoading) {
    console.log('⏳ Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // ✅ CORRECTED: If NOT authenticated → Go to LOGIN page
  if (!isAuthenticated) {
    console.log('🚫 User not authenticated, redirecting to /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  // ✅ If authenticated → Show protected content
  console.log('✅ User authenticated, showing protected content');
  return children;
};

export default ProtectedRoute;