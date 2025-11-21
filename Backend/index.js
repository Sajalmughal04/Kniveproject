// ============================================
// 📁 backend/index.js - COMPLETE CODE
// ============================================

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import User from "./models/User.js"; // ✅ Import User model
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CORS Configuration
// ============================================
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Request Logger Middleware (Development Only)
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      headers: req.headers.authorization ? 'Token present' : 'No token'
    });
    next();
  });
}

// ============================================
// Static Files for Uploads
// ============================================
if (process.env.USE_LOCAL_STORAGE === "true") {
  app.use("/uploads", express.static(path.join(__dirname, process.env.UPLOADS_DIR || "uploads")));
}

// ============================================
// ✅ CREATE DEFAULT ADMIN FUNCTION
// ============================================
const createDefaultAdmin = async () => {
  try {
    // Check if admin user already exists
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (adminUser) {
      console.log('✅ Admin user already exists');
      console.log('📧 Admin Email:', adminUser.email);
      return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const defaultAdmin = new User({
      name: 'Admin',
      email: 'admin@knives.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'admin', // ✅ Important: Set role as admin
      address: 'Admin Office',
      bio: 'System Administrator'
    });

    await defaultAdmin.save();
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ Default Admin User Created!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email: admin@knives.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin');
    console.log('═══════════════════════════════════════');
    console.log('⚠️  IMPORTANT: Change these credentials after first login!\n');
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

// ============================================
// 📊 LOG ENDPOINTS FUNCTION (Optional)
// ============================================
const logEndpoints = () => {
  if (process.env.SHOW_ENDPOINTS === 'true') {
    console.log('📍 Available API Endpoints:');
    console.log('   ──────────────────────────────────');
    console.log('   GET    /');
    console.log('   ──────────────────────────────────');
    console.log('   GET    /api/products');
    console.log('   POST   /api/products');
    console.log('   PUT    /api/products/:id');
    console.log('   DELETE /api/products/:id');
    console.log('   ──────────────────────────────────');
    console.log('   GET    /api/categories');
    console.log('   POST   /api/categories');
    console.log('   PUT    /api/categories/:id');
    console.log('   DELETE /api/categories/:id');
    console.log('   ──────────────────────────────────');
    console.log('   GET    /api/orders');
    console.log('   POST   /api/orders');
    console.log('   ──────────────────────────────────');
    console.log('   POST   /api/auth/login');
    console.log('   POST   /api/auth/register');
    console.log('   GET    /api/auth/profile');
    console.log('   ──────────────────────────────────');
    console.log('   POST   /api/contact');
    console.log('   ──────────────────────────────────');
    console.log('   POST   /api/payment/webhook');
    console.log('   ──────────────────────────────────');
    console.log('   GET    /api/admin');
    console.log('   POST   /api/admin/login');
    console.log('   ──────────────────────────────────\n');
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
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      '/api/products',
      '/api/categories',
      '/api/orders',
      '/api/auth',
      '/api/contact',
      '/api/payment',
      '/api/admin'
    ]
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// MongoDB Connection and Server Start
// ============================================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    
    // ✅ Create default admin after DB connection
    await createDefaultAdmin();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
      
      // Show endpoints if enabled
      logEndpoints();
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });