// backend/routes/categoryRoutes.js - FULLY UPDATED AND CORRECTED
import express from "express";
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protectUser } from "../Middleware/authMiddleware.js"; // ✅ FIXED: Changed from { protect } to { protectUser }

const router = express.Router();

// ✅ Public routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// ✅ Protected routes (Admin only)
router.post("/", protectUser, createCategory); // ✅ FIXED: Changed from protect to protectUser
router.put("/:id", protectUser, updateCategory); // ✅ FIXED: Changed from protect to protectUser
router.delete("/:id", protectUser, deleteCategory); // ✅ FIXED: Changed from protect to protectUser

export default router;
