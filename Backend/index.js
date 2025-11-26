// ============================================
// 📁 backend/index.js - VERCEL COMPATIBLE VERSION
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

// Load environment variables
dotenv.config();

const app = express();

// ============================================
// 🔧 MongoDB Connection with Caching (Vercel Fix)
// ============================================
let cachedDb = null;

async function connectDB() {
  if (cachedDb) {
    console.log("✅ Using cached database connection");
    return cachedDb;
  }

  try {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, opts);
    cachedDb = conn;
    console.log("✅ MongoDB connected");
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

// ============================================
// CORS Configuration
// ============================================
app.use(cors({
  origin: [
    "https://kniveproject.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ============================================
// Webhook route with raw body parser (BEFORE json parser)
// ============================================
app.post("/api/payment/webhook", 
  express.raw({ type: "application/json" }), 
  (req, res, next) => {
    req.url = '/webhook';
    paymentRoutes(req, res, next);
  }
);

// ============================================
// Body Parser Middleware
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Request Logger Middleware (Development Only)
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ✅ CREATE DEFAULT ADMIN FUNCTION
// ============================================
const createDefaultAdmin = async () => {
  try {
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (adminUser) {
      console.log('✅ Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const defaultAdmin = new User({
      name: 'Admin',
      email: 'admin@knives.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'admin',
      address: 'Admin Office',
      bio: 'System Administrator'
    });

    await defaultAdmin.save();
    console.log('✅ Default admin user created');
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

// ============================================
// Root Route
// ============================================
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Knives Backend Server is running!", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
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

// ============================================
// API Routes
// ============================================
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.path} not found`
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || "Internal Server Error"
  });
});

// ============================================
// 🚀 Vercel Serverless Export
// ============================================
// Connect to DB and create admin on first cold start
connectDB().then(() => {
  createDefaultAdmin().catch(console.error);
});

// Export for Vercel
export default async (req, res) => {
  await connectDB();
  return app(req, res);
};

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
  });
}