// backend/routes/adminRoutes.js - UPDATED VERSION
import express from 'express';
import jwt from 'jsonwebtoken'; // Optional, if needed elsewhere
import User from '../models/User.js'; // Assuming shared User model
import { protectAdmin } from '../Middleware/authMiddleware.js'; // ✅ Import protectAdmin from authMiddleware.js

const router = express.Router();

// Admin profile endpoint (used by AdminProtectedRoute for verification)
router.get('/profile', protectAdmin, (req, res) => {
  res.json({ success: true, data: req.user });
});

// Optional: Separate admin login if needed (but not required since you're using shared auth)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Similar to authController login, but check role === 'admin'
  // Implement if you want a dedicated admin login
});

// Add more admin-specific routes here as needed (e.g., for managing users, orders, etc.)

export default router;
