// backend/Middleware/authMiddleware.js - ENHANCED WITH STRICT SESSION CHECKS
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ✅ Generate unique session ID
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
};

// ✅ In-memory session store (for production, use Redis)
const activeSessions = new Map();

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '123456');
      console.log('✅ Token decoded successfully');
      console.log('👤 User ID from token:', decoded.id);

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
        return res.status(401).json({
          success: false,
          message: 'Token expired, please login again',
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
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

// ✅ Protect Admin Routes - STRICT VERSION WITH SESSION TRACKING
export const protectAdmin = async (req, res, next) => {
  try {
    console.log('🔐 ========================================');
    console.log('🔐 protectAdmin: VERIFICATION STARTED');
    console.log('🔐 Request path:', req.path);
    console.log('🔐 Request method:', req.method);
    console.log('🔐 ========================================');
    
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('🔑 Admin token status:', token ? 'PRESENT ✅' : 'MISSING ❌');

    // CRITICAL: No token = immediate rejection
    if (!token) {
      console.log('❌ ========================================');
      console.log('❌ ACCESS DENIED: NO ADMIN TOKEN');
      console.log('❌ ========================================');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    try {
      // Verify token
      console.log('🔄 Verifying admin token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '123456');
      console.log('✅ Token decoded successfully');
      console.log('👤 User ID from token:', decoded.id);

      // Find user in database
      console.log('🔍 Looking up user in database...');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('❌ ========================================');
        console.log('❌ ACCESS DENIED: USER NOT FOUND');
        console.log('❌ User ID:', decoded.id);
        console.log('❌ ========================================');
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      console.log('✅ User found in database');
      console.log('   Email:', req.user.email);
      console.log('   Role:', req.user.role);
      console.log('   ID:', req.user._id);

      // ✅ CRITICAL: Strict admin role check
      if (req.user.role !== 'admin') {
        console.log('❌ ========================================');
        console.log('❌ ACCESS DENIED: NOT AN ADMIN');
        console.log('❌ User role:', req.user.role);
        console.log('❌ User email:', req.user.email);
        console.log('❌ Required role: admin');
        console.log('❌ ========================================');
        
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.',
        });
      }

      // ✅ Check for session validity (optional but recommended)
      const sessionKey = `admin_${req.user._id}`;
      const currentSession = activeSessions.get(sessionKey);
      
      if (currentSession && currentSession.token !== token) {
        console.log('⚠️  ========================================');
        console.log('⚠️  WARNING: MULTIPLE ADMIN SESSIONS DETECTED');
        console.log('⚠️  User email:', req.user.email);
        console.log('⚠️  Current token (first 20 chars):', token.substring(0, 20));
        console.log('⚠️  Stored token (first 20 chars):', currentSession.token.substring(0, 20));
        console.log('⚠️  This might be a security issue!');
        console.log('⚠️  ========================================');
        
        // Optional: Uncomment to enforce single session per admin
        // return res.status(401).json({
        //   success: false,
        //   message: 'Another admin session is active. Please logout from other devices.',
        // });
      }

      // Store/update session
      activeSessions.set(sessionKey, {
        token: token,
        email: req.user.email,
        lastAccess: new Date(),
        ip: req.ip || req.connection.remoteAddress
      });

      console.log('✅ ========================================');
      console.log('✅ ADMIN VERIFIED SUCCESSFULLY');
      console.log('✅ Admin email:', req.user.email);
      console.log('✅ Admin role:', req.user.role);
      console.log('✅ Session updated');
      console.log('✅ GRANTING ACCESS');
      console.log('✅ ========================================');
      
      next();
      
    } catch (tokenError) {
      console.error('❌ ========================================');
      console.error('❌ TOKEN VERIFICATION FAILED');
      console.error('❌ Error type:', tokenError.name);
      console.error('❌ Error message:', tokenError.message);
      console.error('❌ ========================================');
      
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
    console.error('❌ ========================================');
    console.error('❌ ADMIN AUTH MIDDLEWARE ERROR');
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
    console.error('❌ ========================================');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

// ✅ Cleanup old sessions (call this periodically)
export const cleanupSessions = () => {
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [key, session] of activeSessions.entries()) {
    if (now - session.lastAccess > maxAge) {
      console.log('🗑️  Removing expired session:', key);
      activeSessions.delete(key);
    }
  }
};

// ✅ Force logout admin (removes session)
export const forceLogoutAdmin = (userId) => {
  const sessionKey = `admin_${userId}`;
  if (activeSessions.has(sessionKey)) {
    console.log('🚪 Forcing logout for admin:', userId);
    activeSessions.delete(sessionKey);
    return true;
  }
  return false;
};

// ✅ Get active admin sessions count
export const getActiveAdminSessions = () => {
  return activeSessions.size;
};

// ✅ Optional: Log all requests
export const logRequest = (req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  console.log('📊 Headers:', req.headers.authorization ? 'Token Present ✅' : 'No Token ❌');
  next();
};