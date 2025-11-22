// backend/Middleware/authMiddleware.js - ENHANCED WITH BETTER LOGGING
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ✅ Protect User Routes
export const protectUser = async (req, res, next) => {
  try {
    console.log('🔐 protectUser: Checking authentication...');
    
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('🔑 Token received:', token ? 'YES ✅' : 'NO ❌');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '123456');
      console.log('✅ Token decoded successfully');
      console.log('👤 User ID from token:', decoded.id);

      // Find user in database
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('❌ User not found in database');
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      console.log('✅ User authenticated:', req.user.email);
      console.log('👤 User role:', req.user.role);
      next();
      
    } catch (tokenError) {
      console.error('❌ Token verification failed:', tokenError.message);
      
      if (tokenError.name === 'TokenExpiredError') {
        console.log('⏰ Token has expired');
        return res.status(401).json({
          success: false,
          message: 'Token expired, please login again',
        });
      }
      
      if (tokenError.name === 'JsonWebTokenError') {
        console.log('🔒 Invalid token format');
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

// ✅ Protect Admin Routes - STRICT VERSION WITH DETAILED LOGGING
export const protectAdmin = async (req, res, next) => {
  try {
    console.log('🔐 protectAdmin: Checking admin authentication...');
    console.log('📡 Request path:', req.path);
    
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('🔑 Admin token received:', token ? 'YES ✅' : 'NO ❌');

    // CRITICAL: No token = immediate rejection
    if (!token) {
      console.log('❌ No admin token provided - Access Denied');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    try {
      // Verify token
      console.log('🔄 Verifying admin token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '123456');
      console.log('✅ Admin token decoded successfully');
      console.log('👤 User ID from token:', decoded.id);
      console.log('👤 Role from token:', decoded.role);

      // Find user in database
      console.log('🔍 Looking up user in database...');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('❌ Admin user not found in database');
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      console.log('✅ Found user in database:', req.user.email);
      console.log('👤 User role from database:', req.user.role);

      // ✅ CRITICAL: Strict admin role check
      if (req.user.role !== 'admin') {
        console.log('❌ ========================================');
        console.log('❌ ACCESS DENIED: USER IS NOT AN ADMIN');
        console.log('❌ User role:', req.user.role);
        console.log('❌ User email:', req.user.email);
        console.log('❌ ========================================');
        
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.',
        });
      }

      console.log('✅ ========================================');
      console.log('✅ ADMIN VERIFIED SUCCESSFULLY');
      console.log('✅ Admin email:', req.user.email);
      console.log('✅ Admin role:', req.user.role);
      console.log('✅ Granting access to admin route');
      console.log('✅ ========================================');
      
      next();
      
    } catch (tokenError) {
      console.error('❌ Admin token verification failed:', tokenError.message);
      console.error('❌ Token error type:', tokenError.name);
      
      if (tokenError.name === 'TokenExpiredError') {
        console.log('⏰ Admin token has expired');
        return res.status(401).json({
          success: false,
          message: 'Token expired, please login again',
        });
      }
      
      if (tokenError.name === 'JsonWebTokenError') {
        console.log('🔒 Invalid admin token format');
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } catch (error) {
    console.error('❌ Admin auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

// ✅ Optional: Middleware to log all requests
export const logRequest = (req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  console.log('📊 Headers:', req.headers.authorization ? 'Token Present ✅' : 'No Token ❌');
  next();
};