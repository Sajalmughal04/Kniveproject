// api/index.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import Admin from "../models/Admin.js";
import productRoutes from "../routes/productRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import authRoutes from "../routes/authRoutes.js";
import contactRoutes from "../routes/contactRoutes.js";
import paymentRoutes from "../routes/paymentRoutes.js";
import categoryRoutes from "../routes/categoryRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// MongoDB Connection with Caching
let cachedDb = null;

const connectDB = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log("✅ Using cached MongoDB connection");
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedDb = db;
    console.log("✅ MongoDB connected");
    
    // Create default admin
    await createDefaultAdmin();
    
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@knives.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      await Admin.create({ 
        name: "Default Admin", 
        email: adminEmail, 
        password: adminPassword 
      });
      console.log("✅ Default admin created");
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error.message);
  }
};

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, "https://kniveproject-yo2q.vercel.app"]
    : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Webhook route with raw body (BEFORE body parser)
app.post("/api/payment/webhook", 
  express.raw({ type: "application/json" }), 
  (req, res, next) => {
    req.url = '/webhook';
    paymentRoutes(req, res, next);
  }
);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Knife Store API is running!", 
    timestamp: new Date().toISOString(),
    endpoints: { 
      products: "/api/products",
      categories: "/api/categories",
      admin: "/api/admin", 
      orders: "/api/orders",
      auth: "/api/auth",
      contact: "/api/contact",
      payment: "/api/payment"
    }
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "🚀 API is working!", 
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.path} not found` 
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || "Internal Server Error" 
  });
});

// Serverless Handler for Vercel
export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("❌ Handler error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server initialization failed"
    });
  }
}