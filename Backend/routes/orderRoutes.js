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
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', createOrder);
router.get('/email/:email', getOrdersByEmail);

// Protected routes (Admin only)
router.get('/', protect, getAllOrders);
router.get('/stats', protect, getOrderStats);
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);

export default router;