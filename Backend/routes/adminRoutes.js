import express from "express";
import { register, login, getProfile } from "../controllers/adminController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

// ✅ Public Routes
router.post("/register", register);
router.post("/login", login);

// ✅ Protected Routes
router.get("/profile", protect, getProfile);

export default router;