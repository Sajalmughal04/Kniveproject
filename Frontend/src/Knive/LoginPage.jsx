import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:3000/api/auth";

const LoginPage = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Get the page user was trying to access (default to home)
  const from = location.state?.from || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      console.log('🔐 Sending login request...');
      const response = await axios.post(`${API_URL}/login`, {
        email: formData.email,
        password: formData.password,
      });

      console.log('✅ Login response:', response.data);

      // Check if response is successful
      if (response.data.success) {
        // Extract token and user data from correct structure
        const token = response.data.data.token;
        const userData = {
          _id: response.data.data._id,
          name: response.data.data.name,
          email: response.data.data.email,
          phone: response.data.data.phone || '',
          address: response.data.data.address || '',
          bio: response.data.data.bio || '',
        };

        // ✅ Save to localStorage (This creates the profile)
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        console.log('💾 Profile created and saved to localStorage:', userData);

        // ✅ Update parent state (This makes user available globally)
        if (setUser && typeof setUser === 'function') {
          setUser(userData);
          console.log('✅ User state updated - Profile is now active');
        }
        
        // Show success message with toast
        toast.success(`Welcome back, ${userData.name}! 🎉`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Clear form
        setFormData({ email: "", password: "" });
        
        // ✅ Redirect to intended page (checkout, profile, etc) or home
        console.log('🎯 Redirecting to:', from);
        navigate(from, { replace: true });
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle different error types
      if (err.response) {
        // Server responded with error
        setError(err.response.data?.message || "Invalid email or password");
      } else if (err.request) {
        // Request made but no response
        setError("Cannot connect to server. Please check if backend is running.");
      } else {
        // Something else happened
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 pt-24">
      <div className="max-w-md mx-auto">
        <h1 className="text-5xl font-bold text-center text-gray-800 dark:text-white mb-4">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Login to your account to continue
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Show message if redirected from checkout or other protected route */}
          {from !== '/' && (
            <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center font-semibold">
                🔒 Please login to {from === '/checkout' ? 'proceed with checkout' : 'continue'}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
              <span className="block sm:inline">{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white transition"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white transition pr-12"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
              </div>
            </div>

            <p className="text-center text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                state={{ from }}
                className="text-yellow-600 dark:text-yellow-400 font-semibold hover:text-yellow-700 dark:hover:text-yellow-300 hover:underline"
              >
                Create New Account
              </Link>
            </p>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;