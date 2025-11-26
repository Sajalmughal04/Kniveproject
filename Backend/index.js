// ============================================
// backend/index.js - FINAL FIXED VERSION FOR VERCEL
// ============================================

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

import productRoutes from "./routes/productRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

dotenv.config();
const app = express();

// ============================
// MongoDB Connection (Safe for Vercel)
// ============================
let cachedConnection = global.mongoose || null;

async function connectDB() {
  if (cachedConnection) {
    console.log("✅ Using cached MongoDB connection");
    return cachedConnection;
  }

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in environment variables!");
    throw new Error("Please define MONGO_URI in Vercel Environment Variables");
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ New MongoDB connection established");
    
    // Cache for future invocations
    cachedConnection = conn;
    global.mongoose = conn; // Important for Vercel

    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
}

// ============================
// Create Default Admin (Only after DB is ready)
// ============================
async function createDefaultAdmin() {
  try {
    await connectDB(); // Ensure DB is connected first

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("✅ Admin already exists");
      return;
    }

    const hashed = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@knives.com",
      password: hashed,
      phone: "1234567890",
      role: "admin",
      address: "Admin Office",
      bio: "System Administrator"
    });

    console.log("✅ Default admin created: admin@knives.com / admin123");
  } catch (err) {
    console.error("❌ Failed to create admin:", err.message);
  }
}

// ============================
// Middleware
// ============================
app.use(cors({
  origin: ["https://kniveproject.vercel.app", "http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

// Webhook RAW body (must be BEFORE json parser)
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), (req, res) => {
  paymentRoutes(req, res);
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Knives Backend Live on Vercel!", time: new Date().toISOString() });
});

// 404 & Error Handler
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server Error" });
});

// ============================
// VERCEL EXPORT - This is the correct way
// ============================
export default async function handler(req, res) {
  try {
    await connectDB();           // Connect DB on every request (safe)
    await createDefaultAdmin();  // Safe: only creates if not exists
    return app(req, res);
  } catch (error) {
    console.error("Handler crash:", error);
    return res.status(500).json({ error: "Server failed to start", details: error.message });
  }
}

// ============================
// Local Development Only
// ============================
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => createDefaultAdmin())
    .then(() => {
      app.listen(PORT, () => {
        console.log(`\nServer running at http://localhost:${PORT}\n`);
      });
    });
}