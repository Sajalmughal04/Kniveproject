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
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

// ✅ Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// ✅ Protected routes (Admin only)
// Create product with image upload
router.post(
  "/", 
  protect, 
  upload.single('image'), 
  createProduct
);

// Update product with optional image upload
router.put(
  "/:id", 
  protect, 
  upload.single('image'), 
  updateProduct
);

// Delete product
router.delete(
  "/:id", 
  protect, 
  deleteProduct
);

// ✅ Separate endpoint for image upload (optional - if you want to upload images separately)
router.post(
  "/upload/image",
  protect,
  upload.single('image'),
  uploadProductImage
);

export default router;