// backend/routes/categoryRoutes.js - FULLY UPDATED AND CORRECTED
import express from "express";
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protectAdmin } from "../Middleware/authMiddleware.js"; // ✅ Admin-only protection

const router = express.Router();

// ✅ Public routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// ✅ Protected routes (Admin only)
router.post("/", protectAdmin, createCategory); // ✅ Admin-only access
router.put("/:id", protectAdmin, updateCategory); // ✅ Admin-only access
router.delete("/:id", protectAdmin, deleteCategory); // ✅ Admin-only access

export default router;
