// src/components/UserProtectedRoute.jsx - REDUX INTEGRATED VERSION
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth || {});

  console.log('🔐 UserProtectedRoute: Checking user access...');
  console.log('📊 Redux Auth State:', { isAuthenticated, user, loading });
  console.log('👤 User Role:', user?.role);

  // Loading state - if Redux is still checking auth
  if (loading) {
    console.log('⏳ Redux auth loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="text-gray-700 mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → Redirect to login
  if (!isAuthenticated) {
    console.log('🚫 User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if user is actually an admin (prevent admin from accessing user routes)
  if (user?.role === 'admin') {
    console.log('🚫 Admin user trying to access user route, redirecting to dashboard');
    return <Navigate to="/Dashboard" replace />;
  }

  // Authenticated user → Show content
  console.log('✅ User authenticated, showing protected content');
  return children;
};

export default UserProtectedRoute;