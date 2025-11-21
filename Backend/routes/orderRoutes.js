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
import { protectUser } from '../Middleware/authMiddleware.js'; // ✅ FIXED: Changed from { protect } to { protectUser }

const router = express.Router();

// Public routes
router.post('/', createOrder);
router.get('/email/:email', getOrdersByEmail);

// Protected routes (Admin only)
router.get('/', protectUser, getAllOrders); // ✅ FIXED: Changed from protect to protectUser
router.get('/stats', protectUser, getOrderStats); // ✅ FIXED: Changed from protect to protectUser
router.get('/:id', protectUser, getOrderById); // ✅ FIXED: Changed from protect to protectUser
router.put('/:id', protectUser, updateOrderStatus); // ✅ FIXED: Changed from protect to protectUser
router.delete('/:id', protectUser, deleteOrder); // ✅ FIXED: Changed from protect to protectUser

export default router;
