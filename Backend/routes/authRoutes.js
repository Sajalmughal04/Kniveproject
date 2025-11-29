import express from 'express';
import { register, login, getProfile, refreshToken, logout } from '../controllers/authController.js';
import { protectUser } from '../Middleware/authMiddleware.js';
import { loginLimiter, registerLimiter, refreshTokenLimiter } from '../Middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);

// Token refresh endpoint
router.post('/refresh', refreshTokenLimiter, refreshToken);

// Logout endpoint
router.post('/logout', logout);

// Protected routes - using protectUser middleware for user authentication
router.get('/profile', protectUser, getProfile);

export default router;