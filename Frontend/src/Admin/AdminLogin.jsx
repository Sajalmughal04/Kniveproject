import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ✅ Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      console.log('✅ Token found, verifying...');
      verifyAndRedirect(token);
    }
  }, []);

  const verifyAndRedirect = async (token) => {
    try {
      const response = await axios.get('http://localhost:3000/api/admin/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        console.log('✅ Token valid, redirecting...');
        window.location.replace('/admin');
      }
    } catch (error) {
      console.log('❌ Token invalid');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
    }
  };

  // ✅ Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Logging in...');
      
      const response = await axios.post('http://localhost:3000/api/admin/login', {
        email: email.trim().toLowerCase(),
        password
      });

      console.log('📥 Response:', response.data);

      if (response.data && response.data.success) {
        console.log('✅ Login successful!');
        
        const { token, admin } = response.data;
        
        // Save to localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(admin));
        
        console.log('💾 Token saved:', token.substring(0, 20) + '...');
        
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('🚀 Redirecting to /admin...');
        
        // ✅ MULTIPLE REDIRECT METHODS (one will work!)
        
        // Method 1: window.location.replace (most reliable)
        window.location.replace('/admin');
        
        // Method 2: Fallback after 100ms
        setTimeout(() => {
          window.location.href = '/admin';
        }, 100);
        
        // Method 3: React Router fallback after 200ms
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 200);
        
      } else {
        setError('Login failed - Invalid response');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed! Check credentials.';
      setError(errorMessage);
    } finally {
      // Don't set loading to false if redirecting
      if (!localStorage.getItem('adminToken')) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg shadow-blue-500/50">
            <Lock className="text-white" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Login</h2>
          <p className="text-gray-400">Enter your credentials to continue</p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-start space-x-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="admin@knives.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2 ${
              loading 
                ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/50 hover:shadow-blue-600/60 transform hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Login to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center space-x-2">
            <Lock size={14} />
            <span>Secure admin access only</span>
          </p>
        </div>
      </div>
    </div>
  );
}