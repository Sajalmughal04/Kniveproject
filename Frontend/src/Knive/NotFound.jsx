// src/pages/NotFound.jsx - COMPLETE 404 PAGE COMPONENT
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🚫 ========================================');
    console.log('🚫 404 PAGE NOT FOUND');
    console.log('🚫 Attempted URL:', location.pathname);
    console.log('🚫 User tried to access unauthorized/non-existent page');
    console.log('🚫 ========================================');
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
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

        {/* Error Message */}
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

        {/* Illustration */}
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

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 border-2 border-gray-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </motion.div>

        {/* Additional Info */}
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