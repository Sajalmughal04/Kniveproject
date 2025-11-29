import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ✅ Validate JWT secrets on startup
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
}

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('FATAL ERROR: JWT_REFRESH_SECRET is not defined in environment variables');
}

// ✅ Token blacklist (use Redis in production)
const tokenBlacklist = new Set();

// ✅ Generate Access Token (short-lived)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m', // 15 minutes
  });
};

// ✅ Generate Refresh Token (long-lived)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d', // 7 days
  });
};

// ✅ Add token to blacklist
export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  console.log('🚫 Token added to blacklist');
};

// ✅ Check if token is blacklisted
export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    console.log('🚀 REGISTER ROUTE HIT');
    console.log('📦 Request Body:', req.body);

    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Validation failed - Missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const emailLower = email.toLowerCase();

    // Check if user exists
    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      console.log('❌ User already exists:', emailLower);
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    console.log('🔒 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('✅ Password hashed successfully');

    // Create user
    console.log('💾 Creating user in database...');
    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
    });

    if (user) {
      console.log('✅ User created successfully:', user.email);

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: accessToken,
          refreshToken: refreshToken,
        },
      });
    }
  } catch (error) {
    console.error('❌ Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('🔑 LOGIN ROUTE HIT');
    console.log('========================================');
    console.log('📦 Request Body:', req.body);

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('❌ Validation failed - Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const emailLower = email.toLowerCase();

    // Check for user
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      console.log('❌ User NOT found in database:', emailLower);
      console.log('========================================\n');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials - User not found',
      });
    }

    console.log('✅ User found in database!');
    console.log('   User ID:', user._id);
    console.log('   User Email:', user.email);

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log('🔍 Password match result:', isPasswordMatch);

    if (!isPasswordMatch) {
      console.log('❌ Password does NOT match');
      console.log('========================================\n');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials - Wrong password',
      });
    }

    console.log('✅ Password matches! Generating tokens...');
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    console.log('✅ Tokens generated');

    console.log('✅ Login successful for:', user.email);
    console.log('========================================\n');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'customer',
        token: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    console.error('Error Stack:', error.stack);
    console.log('========================================\n');
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    console.log('👤 GET PROFILE ROUTE HIT');
    console.log('🆔 User ID from token:', req.user?.id);

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      console.log('❌ User not found:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('✅ Profile fetched for:', user.email);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('❌ Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (requires refresh token)
export const refreshToken = async (req, res) => {
  try {
    console.log('🔄 REFRESH TOKEN ROUTE HIT');

    const { refreshToken } = req.body;

    if (!refreshToken) {
      console.log('❌ No refresh token provided');
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(refreshToken)) {
      console.log('❌ Refresh token is blacklisted');
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      console.log('✅ Refresh token verified for user:', decoded.id);

      // Generate new access token
      const newAccessToken = generateAccessToken(decoded.id);

      // Optionally generate new refresh token (rotation)
      const newRefreshToken = generateRefreshToken(decoded.id);

      // Blacklist old refresh token
      blacklistToken(refreshToken);

      console.log('✅ New tokens generated');

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (tokenError) {
      console.error('❌ Refresh token verification failed:', tokenError.message);

      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired, please login again',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }
  } catch (error) {
    console.error('❌ Refresh Token Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh',
      error: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    console.log('🚪 LOGOUT ROUTE HIT');

    const { refreshToken } = req.body;
    const accessToken = req.headers.authorization?.split(' ')[1];

    // Blacklist both tokens
    if (accessToken) {
      blacklistToken(accessToken);
      console.log('✅ Access token blacklisted');
    }

    if (refreshToken) {
      blacklistToken(refreshToken);
      console.log('✅ Refresh token blacklisted');
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('❌ Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message,
    });
  }
};
