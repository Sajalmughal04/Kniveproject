// ============================================
// 📁 backend/index.js - VERCEL SERVERLESS VERSION
// ============================================

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

// Models
import Admin from "./models/Admin.js";
import User from "./models/User.js";

// Routes
import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

// Load env
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
app.use(cors({
  origin: [
    "https://kniveproject.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


// ============================================
// Stripe / Payment Webhook (RAW BODY)
// ============================================
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.url = "/webhook";
    paymentRoutes(req, res, next);
  }
);


// ============================================
// JSON PARSER
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ============================================
// STATIC UPLOADS (if enabled)
// ============================================
if (process.env.USE_LOCAL_STORAGE === "true") {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
}


// ============================================
// Create Default Admin Once
// ============================================
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin already exists:", adminExists.email);
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      name: "Admin",
      email: "admin@knives.com",
      password: hashedPassword,
      phone: "1234567890",
      role: "admin",
      address: "Admin Office",
      bio: "System Administrator"
    });

    await admin.save();

    console.log("Default Admin Created:");
    console.log("Email: admin@knives.com");
    console.log("Password: admin123");
  } catch (err) {
    console.error("Error creating admin:", err.message);
  }
};


// ============================================
// ROOT ROUTE
// ============================================
app.get("/", (req, res) => {
  res.json({
    message: "Knives Backend Running Successfully ✔️",
    time: new Date().toISOString(),
    version: "1.0",
    routes: {
      products: "/api/products",
      categories: "/api/categories",
      orders: "/api/orders",
      auth: "/api/auth",
      admin: "/api/admin",
      contact: "/api/contact",
      payment: "/api/payment"
    }
  });
});


// ============================================
// API ROUTES
// ============================================
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);


// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});


// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});


// ============================================
// CONNECT MONGODB (WITHOUT LISTEN())
// ============================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await createDefaultAdmin();
  })
  .catch((err) => {
    console.error("Mongo DB Error:", err.message);
  });


// ============================================
// IMPORTANT FOR VERCEL SERVERLESS
// ============================================
export default app;
