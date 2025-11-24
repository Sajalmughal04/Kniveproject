// backend/routes/productRoutes.js - FIXED VERSION
import express from "express";
import upload from "../Middleware/uploadMiddleware.js"; // ✅ CHANGED: Import from uploadMiddleware
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} from "../controllers/productController.js";
import { protectAdmin } from "../Middleware/authMiddleware.js";

const router = express.Router();

// ✅ Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// ✅ Protected routes (Admin only)
// Create product with image upload
router.post(
  "/", 
  protectAdmin,
  upload.single('image'), 
  createProduct
);

// Update product with optional image upload
router.put(
  "/:id", 
  protectAdmin,
  upload.single('image'), 
  updateProduct
);

// Delete product
router.delete(
  "/:id", 
  protectAdmin,
  deleteProduct
);

// ✅ Separate endpoint for image upload (optional)
router.post(
  "/upload/image",
  protectAdmin,
  upload.single('image'),
  uploadProductImage
);

export default router;