import express from "express";
import * as customerController from "../controllers/customerController.js";
import { protectAdmin } from "../Middleware/authMiddleware.js"; // ✅ Admin-only protection

const router = express.Router();

// ✅ Protected routes (Admin only)
router.get("/", protectAdmin, customerController.getCustomers);
router.get("/:id", protectAdmin, customerController.getCustomer);

export default router;
