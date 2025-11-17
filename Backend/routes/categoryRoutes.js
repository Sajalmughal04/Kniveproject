import express from "express";
import {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

// ✅ Public routes
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

// ✅ Protected routes (Admin only)
router.post("/", protect, createCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;