import express from "express";
import * as customerController from "../controllers/customerController.js";
import { protect } from "../Middleware/authMiddleware.js"; // note: lowercase 'm' in middleware

const router = express.Router();

router.get("/", protect, customerController.getCustomers);
router.get("/:id", protect, customerController.getCustomer);

export default router;
