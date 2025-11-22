// backend/routes/productRoutes.js - FULLY UPDATED AND CORRECTED
import express from "express";
import { upload } from "../config/cloudinary.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} from "../controllers/productController.js";
import { protectAdmin } from "../Middleware/authMiddleware.js"; // ✅ Admin-only protection

const router = express.Router();

// ✅ Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// ✅ Protected routes (Admin only)
// Create product with image upload
router.post(
  "/", 
  protectAdmin, // ✅ Admin-only access
  upload.single('image'), 
  createProduct
);

// Update product with optional image upload
router.put(
  "/:id", 
  protectAdmin, // ✅ Admin-only access
  upload.single('image'), 
  updateProduct
);

// Delete product
router.delete(
  "/:id", 
  protectAdmin, // ✅ Admin-only access
  deleteProduct
);

// ✅ Separate endpoint for image upload (optional - if you want to upload images separately)
router.post(
  "/upload/image",
  protectAdmin, // ✅ Admin-only access
  upload.single('image'),
  uploadProductImage
);

export default router;
