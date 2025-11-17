import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:3000/api/auth";

const RegisterPage = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the page user was trying to access (default to home)
  const from = location.state?.from || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when typing
    if (error) setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Sending registration request...');
      const response = await axios.post(`${API_URL}/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log('✅ Registration successful:', response.data);

      // Check if response is successful
      if (response.data.success) {
        // Show success toast
        toast.success('Account created successfully! Redirecting to login...', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Clear form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        
        // Redirect to login page with the intended destination
        setTimeout(() => {
          navigate("/login", { state: { from } });
        }, 1000);
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      console.error('Error response:', err.response?.data);
      setError(
        err.response?.data?.message || 
        "Registration failed. Please try again."
      );
      
      // Show error toast
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 pt-24">
      <div className="max-w-lg mx-auto">
        <h1 className="text-5xl font-bold text-center text-gray-800 dark:text-white mb-4">
          Create New Account
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Join us and start shopping for premium knives
        </p>

        <form
          onSubmit={handleRegister}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col gap-6"
        >
          {/* Show message if redirected from checkout or other protected route */}
          {from !== '/' && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center font-semibold">
                🔒 Create an account to {from === '/checkout' ? 'proceed with checkout' : 'continue'}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
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

          <div className="flex flex-col">
            <label className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white transition"
              required
              disabled={loading}
            />
          </div>

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
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 characters)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white transition"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white transition"
              required
              disabled={loading}
            />
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
                Creating Account...
              </span>
            ) : (
              "Create Account"
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
            Already have an account?{" "}
            <Link
              to="/login"
              state={{ from }}
              className="text-yellow-600 dark:text-yellow-400 font-semibold hover:text-yellow-700 dark:hover:text-yellow-300 hover:underline"
            >
              Login Here
            </Link>
          </p>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;