import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { protectUser } from '../Middleware/authMiddleware.js'; // ✅ Now importing protectUser

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes - using protectUser middleware for user authentication
router.get('/profile', protectUser, getProfile);

export default router;