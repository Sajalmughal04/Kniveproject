// backend/routes/productRoutes.js
import express from "express";
import upload from "../Middleware/uploadMiddleware.js";
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
router.post(
  "/", 
  protectAdmin,
  (req, res, next) => {
    console.log('🔍 POST /products hit');
    console.log('📝 Body:', req.body);
    console.log('👤 Admin:', req.admin?.email);
    next();
  },
  upload.array('images', 5), // Multiple images
  (req, res, next) => {
    console.log('📁 Files after multer:', req.files?.length || 0);
    if (req.files) {
      req.files.forEach((file, i) => {
        console.log(`  File ${i + 1}:`, file.originalname, '→', file.path);
      });
    }
    next();
  },
  createProduct
);

router.put(
  "/:id", 
  protectAdmin,
  upload.array('images', 5),
  updateProduct
);

router.delete(
  "/:id", 
  protectAdmin,
  deleteProduct
);

router.post(
  "/upload/images",
  protectAdmin,
  upload.array('images', 5),
  uploadProductImage
);

export default router;