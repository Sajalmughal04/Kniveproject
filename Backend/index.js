import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Admin from "./models/Admin.js";
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

// CORS Configuration - Production URLs add karein
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || "https://your-frontend.vercel.app"]
    : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ FIX: Webhook route with raw body parser (SPECIFIC PATH)
app.post("/api/payment/webhook", 
  express.raw({ type: "application/json" }), 
  (req, res, next) => {
    req.url = '/webhook';
    paymentRoutes(req, res, next);
  }
);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger Middleware (Only in Development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      headers: req.headers.authorization ? 'Token present' : 'No token'
    });
    next();
  });
}

// Static Files for Uploads (only in development)
if (process.env.USE_LOCAL_STORAGE === "true" && process.env.NODE_ENV !== 'production') {
  app.use("/uploads", express.static(path.join(__dirname, process.env.UPLOADS_DIR || "uploads")));
}

// MongoDB Connection Handler for Serverless
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
    
    // Create default admin only once
    await createDefaultAdmin();
    
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

// Create Default Admin
const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@knives.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      console.log("📝 Creating default admin...");
      const admin = await Admin.create({ 
        name: "Default Admin", 
        email: adminEmail, 
        password: adminPassword 
      });
      console.log("✅ Default admin created:", admin.email);
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error.message);
  }
};

// Helper function to log endpoints (only in development)
const logEndpoints = () => {
  if (process.env.NODE_ENV === 'development' && process.env.SHOW_ENDPOINTS === 'true') {
    console.log(`\n📦 Available Endpoints:`);
    console.log(`   - Products: /api/products`);
    console.log(`   - Categories: /api/categories`);
    console.log(`   - Admin: /api/admin`);
    console.log(`   - Orders: /api/orders`);
    console.log(`   - Auth: /api/auth`);
    console.log(`   - Contact: /api/contact`);
    console.log(`   - Payment: /api/payment\n`);
  }
};

// Root Route
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Server is running!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
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

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// ✅ API Routes
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || "Internal Server Error" 
  });
});

// ✅ For Local Development
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
      logEndpoints();
    });
  }).catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });
}

// ✅ Serverless Handler for Vercel
const handler = async (req, res) => {
  await connectDB();
  return app(req, res);
};

// Export for Vercel
export default handler;