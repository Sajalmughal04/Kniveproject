// backend/routes/orderRoutes.js - FULLY UPDATED AND CORRECTED
import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByEmail,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
} from '../controllers/orderController.js';
import { protectAdmin } from '../Middleware/authMiddleware.js'; // ✅ Admin-only protection

const router = express.Router();

// Public routes
router.post('/', createOrder);
router.get('/email/:email', getOrdersByEmail);

// Protected routes (Admin only) - Order matters: specific routes before generic ones
router.get('/stats', protectAdmin, getOrderStats); // ✅ Admin-only access
router.get('/', protectAdmin, getAllOrders); // ✅ Admin-only access - must come after /stats
router.get('/:id', protectAdmin, getOrderById); // ✅ Admin-only access
router.put('/:id', protectAdmin, updateOrderStatus); // ✅ Admin-only access
router.delete('/:id', protectAdmin, deleteOrder); // ✅ Admin-only access

export default router;
